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

const mockConfigService = () => ({
  get: jest.fn().mockReturnValue('http://localhost:3000'),
});

describe('UrlsService', () => {
  let service: UrlsService;
  let urlRepository: Repository<Url>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        { provide: getRepositoryToken(Url), useFactory: mockUrlRepository },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    urlRepository = module.get<Repository<Url>>(getRepositoryToken(Url));
  });

  describe('shortenUrl', () => {
    it('should shorten a URL and return the shortened URL', async () => {
      const originalUrl = 'https://example.com';
      const user = new User();
      const shortUrl = 'abc123';
      const createdUrl = { originalUrl, shortUrl, user } as Url;

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
      const urls = [{ user }] as Url[];

      jest.spyOn(urlRepository, 'find').mockResolvedValue(urls);

      const result = await service.findAllByUser(user);
      expect(result).toBe(urls);
      expect(urlRepository.find).toHaveBeenCalledWith({ where: { user } });
    });
  });

  describe('updateUrl', () => {
    it('should update the original URL of a shortened URL', async () => {
      const id = 1;
      const originalUrl = 'https://newexample.com';
      const user = new User();
      const url = { id, originalUrl: 'https://oldexample.com', user } as Url;

      jest.spyOn(urlRepository, 'findOne').mockResolvedValue(url);
      jest.spyOn(urlRepository, 'save').mockResolvedValue(url);

      const result = await service.updateUrl(id, originalUrl, user);
      expect(result).toBe(url);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id, user },
      });
      expect(urlRepository.save).toHaveBeenCalledWith({ ...url, originalUrl });
    });
  });

  describe('deleteUrl', () => {
    it('should mark a URL as deleted', async () => {
      const id = 1;
      const user = new User();
      const url = { id, user, deletedAt: null } as Url;

      jest.spyOn(urlRepository, 'findOne').mockResolvedValue(url);
      jest.spyOn(urlRepository, 'save').mockResolvedValue(url);

      await service.deleteUrl(id, user);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { id, user },
      });
      expect(urlRepository.save).toHaveBeenCalledWith({
        ...url,
        deletedAt: expect.any(Date),
      });
    });
  });
});
