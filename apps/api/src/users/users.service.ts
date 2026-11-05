import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import axios from 'axios';
import { User, UserRole, UserStatus, VerificationStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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

  /**
   * Public marketplace directory: verified, active affiliates only. The
   * `postcode` filter resolves the UK postcode to its city/region and matches
   * the territory stored from Central Hub signup.
   */
  async findPublicDirectory(filters: {
    postcode?: string;
    role?: string;
    search?: string;
    limit?: number;
  }) {
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 50));
    const role = (filters.role || '').toLowerCase().replace('-', '_');
    const search = (filters.search || '').trim().toLowerCase();

    let territory: { city?: string; region?: string; postcode?: string } | null = null;
    if (filters.postcode?.trim()) {
      const resolved = await this.lookupPostalCode(filters.postcode);
      if (!resolved?.found) return { items: [], total: 0, territory: null };
      territory = {
        city: resolved.city,
        region: resolved.region,
        postcode: resolved.postalCode,
      };
    }

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.verificationStatus = :verified', { verified: VerificationStatus.VERIFIED })
      .andWhere('user.status = :active', { active: UserStatus.ACTIVE })
      .andWhere('user.isOnboarded = true');

    if (role && role !== 'all') {
      if (role === 'account_manager') qb.andWhere('user.role = :role', { role: UserRole.ACCOUNT_MANAGER });
      else if (role === 'consultant') qb.andWhere('user.role = :role', { role: UserRole.CONSULTANT });
      else if (role === 'agent') qb.andWhere('user.role = :role', { role: UserRole.AGENT });
    } else {
      qb.andWhere('user.role IN (:...roles)', {
        roles: [UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT],
      });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(COALESCE(user.bio, \'\')) LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (territory) {
      const normalizedPostcode = (territory.postcode || '').toUpperCase().replace(/\s+/g, ' ');
      const outward = normalizedPostcode.split(' ')[0];
      const clauses = [
        `(user.postcode IS NOT NULL AND (
          UPPER(REPLACE(user.postcode, ' ', '')) = :compactPostcode
          OR UPPER(user.postcode) LIKE :outwardPrefix
        ))`,
      ];
      const params: Record<string, unknown> = {
        compactPostcode: normalizedPostcode.replace(/\s+/g, ''),
        outwardPrefix: `${outward} %`,
      };
      if (territory.city) {
        clauses.push('(user.city IS NOT NULL AND LOWER(user.city) = LOWER(:city))');
        params.city = territory.city;
      }
      if (territory.region) {
        clauses.push('(user.region IS NOT NULL AND LOWER(user.region) = LOWER(:region))');
        params.region = territory.region;
      }
      qb.andWhere(`(${clauses.join(' OR ')})`, params);
    }

    const users = await qb.orderBy('user.createdAt', 'DESC').take(limit).getMany();

    const items = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email.split('@')[0],
      email: user.email,
      profileImage: user.profileImage,
      bio: user.bio,
      skills: user.skills ?? [],
      languages: user.languages ?? [],
      hourlyRate: user.hourlyRate,
      currency: user.currency,
      timezone: user.timezone,
      role: user.role,
      postcode: user.postcode,
      city: user.city,
      region: user.region,
      country: user.country,
      isOnboarded: user.isOnboarded,
      isQuizPassed: user.isQuizPassed,
      verificationStatus: user.verificationStatus,
      isPaidVisible: user.isPaidVisible,
      createdAt: user.createdAt,
    }));

    return { items, total: items.length, territory };
  }

  async lookupPostalCode(postcode: string) {
    const normalizedPostcode = String(postcode || '').trim().toUpperCase();
    if (normalizedPostcode.length < 3) {
      throw new BadRequestException('Enter a valid postal code.');
    }

    try {
      // Match CHS: use Nominatim postal-code search restricted to the UK.
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          postalcode: normalizedPostcode,
          country: 'United Kingdom',
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
        headers: { 'User-Agent': '247GBS Affiliates/1.0' },
        timeout: 8000,
      });
      const match = Array.isArray(response.data) ? response.data[0] : null;
      if (!match) return { found: false, postalCode: normalizedPostcode };

      const address = match.address || {};
      const city = address.city || address.town || address.village || address.municipality || address.suburb || '';
      const region = address.state || address.county || address.region || address.admin_county || '';
      const country = address.country || '';

      return {
        found: Boolean(city || region || country),
        postalCode: address.postcode || normalizedPostcode,
        city,
        region,
        country,
        displayName: match.display_name || '',
      };
    } catch (error) {
      this.logger.warn(`Postal-code lookup failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new ServiceUnavailableException('Postal-code lookup is unavailable right now. Please try again.');
    }
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

  /** Batch lookup used to map Central Hub participants to local profiles. */
  async findByMcomUserIds(mcomUserIds: string[]): Promise<User[]> {
    const ids = Array.from(new Set(mcomUserIds.filter(Boolean)));
    if (!ids.length) return [];
    return this.usersRepository.find({ where: { mcomUserId: In(ids) } });
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
