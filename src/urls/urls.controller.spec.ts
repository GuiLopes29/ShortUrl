import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

const mockUrlsService = () => ({
  shortenUrl: jest.fn(),
  findByShortUrl: jest.fn(),
  incrementClicks: jest.fn(),
  findAllByUser: jest.fn(),
  updateUrl: jest.fn(),
  deleteUrl: jest.fn(),
});

const mockJwtService = () => ({
  decode: jest.fn().mockReturnValue({ sub: 1, email: 'user@example.com' }),
});

describe('UrlsController', () => {
  let controller: UrlsController;
  let service: UrlsService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        { provide: UrlsService, useFactory: mockUrlsService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
    service = module.get<UrlsService>(UrlsService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shortenUrl', () => {
    it('should shorten a URL and return the shortened URL', async () => {
      const originalUrl = 'https://example.com';
      const shortUrl = 'http://localhost:3000/abc123';
      const user = new User();
      user.email = 'user@example.com';

      jest.spyOn(service, 'shortenUrl').mockResolvedValue(shortUrl);
      jest
        .spyOn(jwtService, 'decode')
        .mockReturnValue({ sub: 1, email: 'user@example.com' });

      const result = await controller.shortenUrl(originalUrl, `Bearer token`);
      expect(result).toBe(shortUrl);
      expect(service.shortenUrl).toHaveBeenCalledWith(originalUrl, user);
    });
  });

  describe('redirect', () => {
    it('should redirect to the original URL', async () => {
      const shortUrl = 'abc123';
      const originalUrl = 'https://example.com';
      const url = {
        originalUrl,
        shortUrl,
        id: 1,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(),
        deletedAt: null,
        user: new User(),
        setExpirationDate: jest.fn(),
        updateExpirationDate: jest.fn(),
      };
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(service, 'findByShortUrl').mockResolvedValue(url);
      jest.spyOn(service, 'incrementClicks').mockResolvedValue(undefined);

      await controller.redirect(shortUrl, res);
      expect(service.findByShortUrl).toHaveBeenCalledWith(shortUrl);
      expect(service.incrementClicks).toHaveBeenCalledWith(url.id);
      expect(res.redirect).toHaveBeenCalledWith(originalUrl);
    });

    it('should return 404 if URL not found', async () => {
      const shortUrl = 'abc123';
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(service, 'findByShortUrl').mockResolvedValue(null);

      await controller.redirect(shortUrl, res);
      expect(service.findByShortUrl).toHaveBeenCalledWith(shortUrl);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'URL not found' });
    });
  });

  describe('findAllByUser', () => {
    it('should return all URLs for the user', async () => {
      const user = new User();
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
          user: new User(),
          setExpirationDate: jest.fn(),
          updateExpirationDate: jest.fn(),
        },
      ];

      jest.spyOn(service, 'findAllByUser').mockResolvedValue(urls);

      const result = await controller.findAllByUser(user);
      expect(result).toBe(urls);
      expect(service.findAllByUser).toHaveBeenCalledWith(user);
    });
  });

  describe('updateUrl', () => {
    it('should update the original URL of a shortened URL', async () => {
      const shortUrl = 'abc123';
      const originalUrl = 'https://newexample.com';
      const user = new User();
      const url = {
        id: 1,
        originalUrl,
        shortUrl,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(),
        deletedAt: null,
        user: new User(),
        setExpirationDate: jest.fn(),
        updateExpirationDate: jest.fn(),
      };

      jest.spyOn(service, 'updateUrl').mockResolvedValue(url);

      const result = await controller.updateUrl(shortUrl, originalUrl, user);
      expect(result).toBe(url);
      expect(service.updateUrl).toHaveBeenCalledWith(
        shortUrl,
        originalUrl,
        user,
      );
    });
  });

  describe('deleteUrl', () => {
    it('should delete a shortened URL', async () => {
      const shortUrl = 'abc123';
      const user = new User();

      jest.spyOn(service, 'deleteUrl').mockResolvedValue(undefined);

      await controller.deleteUrl(shortUrl, user);
      expect(service.deleteUrl).toHaveBeenCalledWith(shortUrl, user);
    });
  });
});
