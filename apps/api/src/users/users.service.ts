import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, UserRole, UserStatus, VerificationStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      isOnboarded: false, // Explicitly false for regular users
      verificationStatus: VerificationStatus.PENDING,
    });

    return this.usersRepository.save(user);
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createAdminDto.password, salt);

    const user = this.usersRepository.create({
      ...createAdminDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isOnboarded: true, // Admins are auto-onboarded
    });

    return this.usersRepository.save(user);
  }

  async setQuizPassed(id: string) {
    const user = await this.findOne(id);
    user.isQuizPassed = true;
    await this.usersRepository.save(user);
    await this.checkAndSetOnboarding(user.id);
  }

  async updateSkills(id: string, skills: string[]) {
    const user = await this.findOne(id);
    user.skills = skills;
    await this.usersRepository.save(user);
    await this.checkAndSetOnboarding(user.id);
    return user;
  }

  async completeOnboarding(id: string) {
    const user = await this.findOne(id);
    if (user.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new ForbiddenException('An administrator must verify your account before onboarding can be completed.');
    }
    if (!user.verificationSubmission || !user.verificationDocumentMimeType || !user.isQuizPassed || !user.skills?.length) {
      throw new ForbiddenException('Submit your profile and identity document, select your skills, and pass the assessment before completing onboarding.');
    }
    user.isOnboarded = true;
    return this.usersRepository.save(user);
  }

  private async checkAndSetOnboarding(userId: string) {
    const user = await this.findOne(userId);
    // Check if user is already onboarded to avoid redundant updates
    if (!user.isOnboarded) {
      if (
        user.verificationStatus === VerificationStatus.VERIFIED &&
        user.verificationSubmission &&
        user.verificationDocumentMimeType &&
        user.isQuizPassed &&
        user.skills &&
        user.skills.length > 0
      ) {
        user.isOnboarded = true;
        await this.usersRepository.save(user);
      }
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData as never);
    return this.findOne(id);
  }

  async getAgents(): Promise<Partial<User>[]> {
    return this.usersRepository.find({
      where: { role: UserRole.AGENT },
      select: ['id', 'firstName', 'lastName', 'email', 'profileImage', 'skills', 'isOnboarded', 'isQuizPassed', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Backend-to-backend directory used by Central Hub to search affiliates by
   * skill. Returns only non-sensitive profile fields.
   */
  async listAffiliateDirectory(): Promise<Array<Partial<User>>> {
    return this.usersRepository.find({
      where: {
        role: In([UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT]),
        status: UserStatus.ACTIVE,
      },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'role',
        'skills',
        'languages',
        'verificationStatus',
        'isOnboarded',
        'isQuizPassed',
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
