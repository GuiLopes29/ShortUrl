import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from './urls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const mockUrlRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  increment: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn().mockReturnValue('http://localhost:3000'),
});

describe('UrlsService', () => {
  let service: UrlsService;
  let urlRepository: Repository<Url>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        { provide: getRepositoryToken(Url), useFactory: mockUrlRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    urlRepository = module.get<Repository<Url>>(getRepositoryToken(Url));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shortenUrl', () => {
    it('should shorten a URL and return the shortened URL', async () => {
      const originalUrl = 'https://example.com';
      const user = undefined;
      const shortUrl = 'abc123';
      const createdUrl = { originalUrl, shortUrl, user } as Url;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service as any, 'generateShortUrl').mockReturnValue(shortUrl);
      jest.spyOn(urlRepository, 'create').mockReturnValue(createdUrl);
      jest.spyOn(urlRepository, 'save').mockResolvedValue(createdUrl);

      const result = await service.shortenUrl(originalUrl, user);
      expect(result).toBe(`http://localhost:3000/${shortUrl}`);
      expect(urlRepository.create).toHaveBeenCalledWith({
        originalUrl,
        shortUrl,
        user,
      });
      expect(urlRepository.save).toHaveBeenCalledWith(createdUrl);
    });
  });

  describe('findByShortUrl', () => {
    it('should find a URL by its short URL', async () => {
      const shortUrl = 'abc123';
      const foundUrl = { shortUrl } as Url;

      jest.spyOn(urlRepository, 'findOne').mockResolvedValue(foundUrl);

      const result = await service.findByShortUrl(shortUrl);
      expect(result).toBe(foundUrl);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { shortUrl },
      });
    });
  });

  describe('incrementClicks', () => {
    it('should increment the click count of a URL', async () => {
      const id = 1;

      jest.spyOn(urlRepository, 'increment').mockResolvedValue(undefined);

      await service.incrementClicks(id);
      expect(urlRepository.increment).toHaveBeenCalledWith({ id }, 'clicks', 1);
    });
  });

  describe('findAllByUser', () => {
    it('should find all URLs by user', async () => {
      const user = new User();
      user.email = 'user@example.com';
      const urls = [
        {
          id: 1,
          shortUrl: 'abc123',
          originalUrl: 'https://example.com',
          clicks: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(),
          deletedAt: null,
          user,
        },
      ] as Url[];

      jest.spyOn(urlRepository, 'find').mockResolvedValue(urls);

      const result = await service.findAllByUser(user);
      expect(result).toEqual(
        urls.map((url) => ({
          originalUrl: url.originalUrl,
          shortUrl: `http://localhost:3000/${url.shortUrl}`,
          clicks: url.clicks,
          expiresAt: url.expiresAt,
        })),
      );
      expect(urlRepository.find).toHaveBeenCalledWith({
        where: {
          user,
          deletedAt: null,
          expiresAt: expect.any(Object),
        },
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });

  describe('updateUrl', () => {
    it('should update the original URL of a shortened URL', async () => {
      const shortUrl = 'abc123';
      const originalUrl = 'https://newexample.com';
      const user = new User();
      user.email = 'user@example.com';
      const url = {
        id: 1,
        originalUrl: 'https://oldexample.com',
        shortUrl,
        user,
      } as Url;

      jest.spyOn(urlRepository, 'findOne').mockResolvedValue(url);
      jest.spyOn(urlRepository, 'save').mockResolvedValue(url);

      const result = await service.updateUrl(shortUrl, originalUrl, user);
      expect(result).toBe(url);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { shortUrl, user },
      });
      expect(urlRepository.save).toHaveBeenCalledWith({ ...url, originalUrl });
    });
  });

  describe('deleteUrl', () => {
    it('should mark a URL as deleted and update the expiration date', async () => {
      const shortUrl = 'abc123';
      const user = new User();
      user.email = 'user@example.com';
      const url = { id: 1, shortUrl, user, deletedAt: null } as Url;

      jest.spyOn(urlRepository, 'findOne').mockResolvedValue(url);
      jest.spyOn(urlRepository, 'save').mockResolvedValue(url);

      await service.deleteUrl(shortUrl, user);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { shortUrl, user },
      });
      expect(urlRepository.save).toHaveBeenCalledWith({
        ...url,
        deletedAt: expect.any(Date),
        expiresAt: expect.any(Date),
      });
    });
  });
});
