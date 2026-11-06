import { BadRequestException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from './users.service';
import { User, UserRole, UserStatus, VerificationStatus } from './entities/user.entity';

describe('UsersService onboarding verification gate', () => {
  let service: UsersService;
  let user: Partial<User>;
  const repository = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    user = {
      id: 'affiliate-1',
      role: UserRole.AGENT,
      verificationStatus: VerificationStatus.PENDING,
      verificationSubmission: { country: 'GB' },
      verificationDocumentMimeType: 'application/pdf',
      isQuizPassed: true,
      skills: ['Client discovery'],
      isOnboarded: false,
    };
    repository.findOne.mockImplementation(async () => user);
    repository.save.mockImplementation(async (value) => Object.assign(user as object, value));
    service = new UsersService(repository as never);
  });

  it('refuses onboarding completion while verification is pending, even when other requirements are complete', async () => {
    await expect(service.completeOnboarding('affiliate-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('registers a new affiliate as pending verification and not onboarded', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    const created = await service.create({ email: 'new-affiliate@example.test', password: 'secure-password', role: UserRole.AGENT });

    expect(created.verificationStatus).toBe(VerificationStatus.PENDING);
    expect(created.isOnboarded).toBe(false);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      verificationStatus: VerificationStatus.PENDING,
      isOnboarded: false,
      role: UserRole.AGENT,
    }));
  });

  it('requires profile submission, identity document, assessment, and skills after verification', async () => {
    user.verificationStatus = VerificationStatus.VERIFIED;
    user.verificationDocumentMimeType = null;

    await expect(service.completeOnboarding('affiliate-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('completes onboarding once an admin verified the submitted profile and all existing requirements are met', async () => {
    user.verificationStatus = VerificationStatus.VERIFIED;

    const result = await service.completeOnboarding('affiliate-1');

    expect(result.isOnboarded).toBe(true);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ isOnboarded: true }));
  });
});

describe('UsersService postal-code lookup', () => {
  const repository = { findOne: jest.fn() };
  const service = new UsersService(repository as never);

  afterEach(() => jest.restoreAllMocks());

  it('uses the CHS Nominatim UK lookup and returns available location fields', async () => {
    const get = jest.spyOn(axios, 'get').mockResolvedValue({ data: [{
      address: { postcode: 'SW1A 1AA', city: 'London', state: 'England', country: 'United Kingdom' },
      display_name: 'London, England, United Kingdom',
    }] } as never);

    await expect(service.lookupPostalCode('sw1a 1aa')).resolves.toEqual({
      found: true,
      postalCode: 'SW1A 1AA',
      city: 'London',
      region: 'England',
      country: 'United Kingdom',
      displayName: 'London, England, United Kingdom',
    });
    expect(get).toHaveBeenCalledWith('https://nominatim.openstreetmap.org/search', expect.objectContaining({
      params: expect.objectContaining({ postalcode: 'SW1A 1AA', country: 'United Kingdom' }),
    }));
  });

  it('returns found=false for an unsupported postal code', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data: [] } as never);
    await expect(service.lookupPostalCode('ZZ99 9ZZ')).resolves.toEqual({ found: false, postalCode: 'ZZ99 9ZZ' });
  });

  it('reports malformed postal-code input and upstream lookup failures distinctly', async () => {
    await expect(service.lookupPostalCode('x')).rejects.toBeInstanceOf(BadRequestException);
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('network unavailable'));
    await expect(service.lookupPostalCode('SW1A 1AA')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

describe('UsersService public directory radius filter', () => {
  const buildAffiliate = (
    id: string,
    postcode: string,
    role: UserRole = UserRole.AGENT,
  ): Partial<User> => ({
    id,
    firstName: id,
    lastName: 'Affiliate',
    email: `${id}@example.test`,
    role,
    status: UserStatus.ACTIVE,
    postcode,
  });

  const createRepository = (users: Array<Partial<User>>) => ({
    createQueryBuilder: jest.fn(() => {
      const queryBuilder: Record<string, jest.Mock> = {};
      for (const method of [
        'where',
        'andWhere',
        'orderBy',
        'addOrderBy',
        'take',
      ]) {
        queryBuilder[method] = jest.fn(() => queryBuilder);
      }
      queryBuilder.getMany = jest.fn(() => Promise.resolve(users));
      return queryBuilder;
    }),
  });

  // ~0.44 degrees of latitude is roughly 30 miles.
  const london = { lat: 51.501, lng: -0.141 };
  const geocodes = new Map<string, { lat: number; lng: number }>([
    ['SW1A1AA', london],
    ['N11AA', { lat: 51.501 + 0.44, lng: -0.141 }],
    ['B11AA', { lat: 52.486, lng: -1.89 }],
  ]);

  const createService = (users: Array<Partial<User>>) => {
    const service = new UsersService(createRepository(users) as never);
    jest.spyOn(service, 'lookupPostalCode').mockResolvedValue({
      found: true,
      postalCode: 'SW1A 1AA',
      city: 'London',
      region: 'England',
      latitude: london.lat,
      longitude: london.lng,
    });
    (
      service as unknown as { bulkGeocodePostcodes: jest.Mock }
    ).bulkGeocodePostcodes = jest.fn(() => Promise.resolve(geocodes));
    return service;
  };

  const users = [
    buildAffiliate('near', 'SW1A 1AA'),
    buildAffiliate('mid', 'N1 1AA'),
    buildAffiliate('far', 'B1 1AA'),
    buildAffiliate('unknown', ''),
  ];

  afterEach(() => jest.restoreAllMocks());

  it('keeps only affiliates inside the default 50 mile radius and excludes unknown postcodes', async () => {
    const service = createService(users);

    const result = await service.findPublicDirectory({ postcode: 'SW1A 1AA' });

    expect(result.items.map((item) => item.id)).toEqual(['near', 'mid']);
    expect(
      result.items.every(
        (item) => item.distanceMiles != null && item.distanceMiles <= 50,
      ),
    ).toBe(true);
  });

  it('widens the results when a larger radius is requested', async () => {
    const service = createService(users);

    const result = await service.findPublicDirectory({
      postcode: 'SW1A 1AA',
      radiusMiles: 500,
    });

    expect(result.items.map((item) => item.id)).toEqual(['near', 'mid', 'far']);
  });

  it('returns the unfiltered list when affiliate geocoding is unavailable', async () => {
    const service = createService(users);
    (
      service as unknown as { bulkGeocodePostcodes: jest.Mock }
    ).bulkGeocodePostcodes = jest.fn(() => Promise.resolve(new Map()));

    const result = await service.findPublicDirectory({ postcode: 'SW1A 1AA' });

    expect(result.items.map((item) => item.id)).toEqual([
      'near',
      'mid',
      'far',
      'unknown',
    ]);
    expect(result.items.every((item) => item.distanceMiles == null)).toBe(true);
  });
});
