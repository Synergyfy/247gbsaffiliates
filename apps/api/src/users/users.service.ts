import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import axios from 'axios';
import { User, UserRole, UserStatus, VerificationStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PostalLookupResult {
  found: boolean;
  postalCode: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  displayName?: string;
}

export interface GeoDetails {
  point: GeoPoint | null;
  adminDistrict?: string;
  region?: string;
  postTown?: string;
  formattedLocation?: string;
}

interface PostcodesIoResult {
  postcode?: string;
  post_town?: string;
  admin_district?: string;
  admin_county?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

interface PostcodesIoResponse {
  result?: PostcodesIoResult;
}

interface PostcodesIoBulkRow {
  query?: string;
  result?: PostcodesIoResult | null;
}

interface PostcodesIoBulkResponse {
  result?: PostcodesIoBulkRow[];
}

interface NominatimMatch {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: Record<string, string>;
}

const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DIRECTORY_RADIUS_MILES = 5;
const MAX_DIRECTORY_RADIUS_MILES = 5;
const MAX_DIRECTORY_CANDIDATES = 500;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly geoCache = new Map<
    string,
    { at: number; data: GeoDetails }
  >();

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
   * Public marketplace directory: verified, active affiliates only. When a
   * postcode is supplied we geocode it once and rank members by their real
   * distance from that territory.
   *
   * Location data is captured by Central Hub at signup and synced onto the
   * local user by the SSO provisioner. The old exact-prefix/city/region filter
   * is intentionally gone: `region` is usually just "England", which matched
   * every affiliate in the country instead of nearby ones.
   */
  async findPublicDirectory(filters: {
    postcode?: string;
    role?: string;
    search?: string;
    limit?: number;
    radiusMiles?: number;
  }) {
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 50));
    const rawRadius = filters.radiusMiles !== undefined ? Number(filters.radiusMiles) : undefined;
    const radiusMiles = rawRadius !== undefined
      ? Math.max(0, Math.min(MAX_DIRECTORY_RADIUS_MILES, rawRadius))
      : DEFAULT_DIRECTORY_RADIUS_MILES;
    const isExactOnly = radiusMiles === 0;
    const role = (filters.role || '').toLowerCase().replace('-', '_');
    const search = (filters.search || '').trim().toLowerCase();

    const searchPostcode = this.normalizePostcode(filters.postcode);
    const searchCompact = this.compactPostcode(filters.postcode);

    let territory: { city?: string; region?: string; postcode?: string } | null = null;
    let origin: GeoPoint | null = null;
    if (searchCompact) {
      try {
        const resolved = await this.lookupPostalCode(filters.postcode!);
        if (resolved?.found) {
          territory = {
            city: resolved.city,
            region: resolved.region,
            postcode: resolved.postalCode,
          };
          if (resolved.latitude != null && resolved.longitude != null) {
            origin = { lat: resolved.latitude, lng: resolved.longitude };
          }
        }
      } catch (err) {
        this.logger.warn(
          `Postal lookup unavailable for "${filters.postcode}", matching by postcode pattern: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.status = :active', { active: UserStatus.ACTIVE })
      .andWhere('user.verificationStatus = :verified', { verified: VerificationStatus.VERIFIED })
      .andWhere('user.isOnboarded = :onboarded', { onboarded: true });

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

    const rawUsers = await qb
      .orderBy('user.isOnboarded', 'DESC')
      .addOrderBy('user.createdAt', 'DESC')
      .take(origin ? MAX_DIRECTORY_CANDIDATES : limit)
      .getMany();

    const users = rawUsers.filter(
      (user) =>
        user.role !== UserRole.AGENT ||
        (user.isQuizPassed && Array.isArray(user.skills) && user.skills.length > 0),
    );

    const geoByPostcode = await this.bulkGeocodePostcodes(users.map((user) => user.postcode));

    const items = users.map((user) => {
      const userCompact = this.compactPostcode(user.postcode);
      const isExactMatch = Boolean(
        searchCompact && userCompact && userCompact === searchCompact,
      );
      const isOutcodeMatch = Boolean(
        !isExactMatch &&
          searchCompact &&
          userCompact &&
          (userCompact.startsWith(searchCompact) || searchCompact.startsWith(userCompact)),
      );

      const geo = user.postcode ? geoByPostcode.get(userCompact) : null;
      const point = origin && geo?.point ? geo.point : null;
      const km = isExactMatch ? 0 : origin && point ? this.haversineKm(origin, point) : null;
      const miles = isExactMatch ? 0 : km != null ? km * 0.621371 : null;

      // Always use full geographic hierarchy (e.g. "Westminster, Greater London" or "Islington, Greater London")
      const resolvedRegion =
        geo?.formattedLocation ||
        (user.region && user.city && user.region.toLowerCase() !== user.city.toLowerCase()
          ? user.region
          : geo?.adminDistrict
            ? `${geo.adminDistrict}, Greater London`
            : user.region || 'Greater London');
      const resolvedCity = geo?.postTown || user.city || 'London';

      return {
        id: user.id,
        centralUserId: user.mcomUserId ?? undefined,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email.split('@')[0],
        profileImage: user.profileImage,
        bio: user.bio,
        skills: user.skills ?? [],
        languages: user.languages ?? [],
        hourlyRate: user.hourlyRate,
        currency: user.currency,
        timezone: user.timezone,
        role: user.role,
        postcode: user.postcode,
        city: resolvedCity,
        region: resolvedRegion,
        country: user.country,
        isOnboarded: user.isOnboarded,
        isQuizPassed: user.isQuizPassed,
        verificationStatus: user.verificationStatus,
        isPaidVisible: user.isPaidVisible,
        createdAt: user.createdAt,
        isExactMatch,
        isOutcodeMatch,
        distanceKm: isExactMatch ? 0 : km != null ? Math.round(km * 10) / 10 : null,
        distanceMiles: isExactMatch ? 0 : miles != null ? Math.round(miles * 10) / 10 : null,
        distanceLabel: isExactMatch
          ? 'Exact postcode match'
          : isOutcodeMatch
            ? 'Same postcode area'
            : miles != null
              ? `${Math.max(0.1, Math.round(miles * 10) / 10)} mi away`
              : origin
                ? 'Distance unavailable'
                : null,
      };
    });

    let matching = items;
    if (searchCompact) {
      // 1. Strict priority: exact postcode match or outward code match (as much as the postcode spans)
      const exactOrOutcodeMatches = items.filter(
        (item) => item.isExactMatch || item.isOutcodeMatch,
      );

      if (exactOrOutcodeMatches.length > 0) {
        // When matches in this postcode or outward area exist, strictly return only them
        matching = exactOrOutcodeMatches;
      } else if (origin) {
        // Fallback only if no exact/outcode matches: search within 5 miles or less
        const effectiveRadius = Math.min(radiusMiles, DEFAULT_DIRECTORY_RADIUS_MILES);
        matching = items.filter(
          (item) => item.distanceMiles != null && item.distanceMiles <= effectiveRadius,
        );
      } else {
        matching = [];
      }
    }

    matching.sort((a, b) => {
      if (a.isExactMatch && !b.isExactMatch) return -1;
      if (!a.isExactMatch && b.isExactMatch) return 1;
      if (a.isOutcodeMatch && !b.isOutcodeMatch) return -1;
      if (!a.isOutcodeMatch && b.isOutcodeMatch) return 1;
      return (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999);
    });

    return {
      items: matching.slice(0, limit),
      total: matching.length,
      territory,
      distanceFrom: territory?.postcode ?? (searchPostcode || null),
    };
  }

  private normalizePostcode(postcode?: string | null): string {
    return (postcode || '').toUpperCase().replace(/\s+/g, ' ').trim();
  }

  private compactPostcode(postcode?: string | null): string {
    return this.normalizePostcode(postcode).replace(/\s+/g, '');
  }

  private haversineKm(a: GeoPoint, b: GeoPoint): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const radius = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /**
   * Bulk geocode every affiliate postcode in one or more postcodes.io calls.
   * Results are cached for a day so repeated directory searches stay cheap.
   */
  private async bulkGeocodePostcodes(
    postcodes: Array<string | null | undefined>,
  ): Promise<Map<string, GeoDetails>> {
    const found = new Map<string, GeoDetails>();
    const unique = Array.from(
      new Set(postcodes.map((postcode) => this.compactPostcode(postcode)).filter(Boolean)),
    );
    if (!unique.length) return found;

    const missing: string[] = [];
    for (const compact of unique) {
      const cached = this.geoCache.get(compact);
      if (cached && Date.now() - cached.at < GEO_CACHE_TTL_MS) {
        if (cached.data) found.set(compact, cached.data);
      } else {
        missing.push(compact);
      }
    }

    for (let index = 0; index < missing.length; index += 100) {
      const chunk = missing.slice(index, index + 100);
      try {
        const response = await axios.post<PostcodesIoBulkResponse>(
          'https://api.postcodes.io/postcodes',
          { postcodes: chunk },
          { timeout: 8000 },
        );
        const rows = Array.isArray(response.data?.result) ? response.data.result : [];
        for (const row of rows) {
          const compact = this.compactPostcode(row?.query || row?.result?.postcode);
          if (!compact) continue;
          const lat = row?.result?.latitude;
          const lng = row?.result?.longitude;
          const point =
            typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;

          const district = row?.result?.admin_district || '';
          const broadRegion = row?.result?.region === 'London'
            ? 'Greater London'
            : (row?.result?.region || row?.result?.admin_county || '');
          const town = row?.result?.post_town || '';

          let formattedLocation = '';
          if (district && broadRegion) {
            formattedLocation = district.toLowerCase() === broadRegion.toLowerCase()
              ? district
              : `${district}, ${broadRegion}`;
          } else if (district) {
            formattedLocation = district;
          } else if (town && broadRegion) {
            formattedLocation = `${town}, ${broadRegion}`;
          } else {
            formattedLocation = town || broadRegion || '';
          }

          const data: GeoDetails = {
            point,
            adminDistrict: district,
            region: broadRegion,
            postTown: town,
            formattedLocation,
          };

          this.geoCache.set(compact, { at: Date.now(), data });
          found.set(compact, data);
        }
      } catch (error) {
        this.logger.warn(
          `Bulk postcode lookup failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return found;
  }

  async lookupPostalCode(postcode: string): Promise<PostalLookupResult> {
    const normalizedPostcode = this.normalizePostcode(postcode);
    if (normalizedPostcode.length < 3) {
      throw new BadRequestException('Enter a valid postal code.');
    }

    try {
      // postcodes.io is the primary source used by Central, and returns
      // coordinates in the same response.
      return await this.resolveWithPostcodesIo(normalizedPostcode);
    } catch (error) {
      if (error instanceof BadRequestException) {
        return { found: false, postalCode: normalizedPostcode };
      }
      this.logger.warn(
        `postcodes.io lookup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    try {
      return await this.resolveWithNominatim(normalizedPostcode);
    } catch (error) {
      this.logger.warn(`Postal-code lookup failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new ServiceUnavailableException('Postal-code lookup is unavailable right now. Please try again.');
    }
  }

  private async resolveWithPostcodesIo(postcode: string): Promise<PostalLookupResult> {
    const clean = postcode.replace(/\s+/g, '');
    let response: { data?: PostcodesIoResponse } | undefined;
    try {
      response = await axios.get<PostcodesIoResponse>(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`,
        { timeout: 8000 },
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Fallback for partial / outward postcodes (e.g. EC1A, SW1A)
        try {
          const outcodeRes = await axios.get<{
            status: number;
            result: {
              outcode: string;
              latitude: number;
              longitude: number;
              admin_district?: string[];
              parish?: string[];
              country?: string[];
            };
          }>(`https://api.postcodes.io/outcodes/${encodeURIComponent(clean)}`, { timeout: 8000 });
          const outResult = outcodeRes.data?.result;
          if (outResult) {
            const city = outResult.admin_district?.[0] || '';
            const region = outResult.admin_district?.[1] || outResult.admin_district?.[0] || '';
            return {
              found: true,
              postalCode: outResult.outcode || postcode,
              city,
              region,
              country: 'United Kingdom',
              latitude: outResult.latitude ?? null,
              longitude: outResult.longitude ?? null,
              displayName: [outResult.outcode, city, 'United Kingdom'].filter(Boolean).join(', '),
            };
          }
        } catch {
          // Fall through to 404
        }
        throw new BadRequestException('We could not find that UK postcode.');
      }
      throw error;
    }

    const result = response.data?.result;
    if (!result) {
      throw new Error('postcodes.io returned no result payload');
    }

    const district = result.admin_district || '';
    const broadRegion = result.region === 'London'
      ? 'Greater London'
      : (result.region || result.admin_county || '');
    const town = result.post_town || district || broadRegion || 'United Kingdom';

    let region = '';
    if (district && broadRegion) {
      region = district.toLowerCase() === broadRegion.toLowerCase()
        ? district
        : `${district}, ${broadRegion}`;
    } else {
      region = district || broadRegion;
    }

    return {
      found: Boolean(town || region),
      postalCode: result.postcode || postcode,
      city: town,
      region,
      country: 'United Kingdom',
      latitude: result.latitude ?? null,
      longitude: result.longitude ?? null,
      displayName: [result.postcode, region, 'United Kingdom'].filter(Boolean).join(', '),
    };
  }

  private async resolveWithNominatim(postcode: string): Promise<PostalLookupResult> {
    // Nominatim postal-code search restricted to the UK (fallback only).
    const response = await axios.get<NominatimMatch[]>('https://nominatim.openstreetmap.org/search', {
      params: {
        postalcode: postcode,
        country: 'United Kingdom',
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
      headers: { 'User-Agent': '247GBS Affiliates/1.0' },
      timeout: 8000,
    });
    const match = Array.isArray(response.data) ? response.data[0] : null;
    if (!match) return { found: false, postalCode: postcode };

    const address = match.address || {};
    const city = address.city || address.town || address.village || address.municipality || address.suburb || '';
    const region = address.state || address.county || address.region || address.admin_county || '';
    const country = address.country || 'United Kingdom';

    return {
      found: Boolean(city || region || country),
      postalCode: address.postcode || postcode,
      city,
      region,
      country,
      latitude: match.lat != null ? Number(match.lat) : undefined,
      longitude: match.lon != null ? Number(match.lon) : undefined,
      displayName: match.display_name || '',
    };
  }

  /**
   * A user is ready to work when an administrator has verified their identity,
   * they submitted their profile + document, and passed the assessment. Agents
   * additionally need at least one approved skill for marketplace matching.
   * Account managers/consultants are relationship roles, so a missing skill
   * list must never leave them permanently locked out after verification.
   */
  private meetsOnboardingRequirements(user: User): boolean {
    return Boolean(
      user.verificationStatus === VerificationStatus.VERIFIED &&
        user.verificationSubmission &&
        user.verificationDocumentMimeType &&
        user.isQuizPassed &&
        (user.role !== UserRole.AGENT || (user.skills && user.skills.length > 0)),
    );
  }

  async completeOnboarding(id: string) {
    const user = await this.findOne(id);
    if (user.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new ForbiddenException('An administrator must verify your account before onboarding can be completed.');
    }
    if (!this.meetsOnboardingRequirements(user)) {
      throw new ForbiddenException(
        'Submit your profile and identity document and pass the assessment before completing onboarding.',
      );
    }
    user.isOnboarded = true;
    return this.usersRepository.save(user);
  }

  /**
   * Self-heal a stale onboarding flag. Verification, assessment and skills can
   * arrive in a different order (an admin may verify before the quiz result is
   * written), which previously left a verified user stuck on `isOnboarded=false`.
   */
  async reconcileOnboarding(id: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user.isOnboarded && this.meetsOnboardingRequirements(user)) {
      user.isOnboarded = true;
      return this.usersRepository.save(user);
    }
    return user;
  }

  private async checkAndSetOnboarding(userId: string) {
    await this.reconcileOnboarding(userId);
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
    const rows = await this.usersRepository.find({
      where: {
        role: In([UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT]),
        status: UserStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        isOnboarded: true,
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

    return rows.filter(
      (user) =>
        user.role !== UserRole.AGENT ||
        (user.isQuizPassed && Array.isArray(user.skills) && user.skills.length > 0),
    );
  }
}
