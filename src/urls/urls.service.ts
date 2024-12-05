import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlsService {
  private readonly domain: string;

  constructor(
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.domain =
      this.configService.get<string>('DOMAIN') ||
      `http://localhost:${this.configService.get<number>('PORT')}`;
  }

  async shortenUrl(originalUrl: string, user?: User): Promise<string> {
    const shortUrl = this.generateShortUrl();

    if (user) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: user.email },
      });

      const existingUrl = await this.urlsRepository.findOne({
        where: { originalUrl, user: existingUser },
      });

      if (existingUrl) {
        return `${this.domain}/${existingUrl.shortUrl}`;
      }

      const url = this.urlsRepository.create({
        originalUrl,
        shortUrl,
        user: existingUser,
      });
      await this.urlsRepository.save(url);

      return `${this.domain}/${shortUrl}`;
    }

    const url = this.urlsRepository.create({ originalUrl, shortUrl });
    await this.urlsRepository.save(url);
    return `${this.domain}/${shortUrl}`;
  }

  private generateShortUrl(): string {
    let shortUrl = '';
    while (shortUrl.length < 6) {
      const buffer = crypto.randomBytes(3);
      shortUrl += buffer.toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    }
    return shortUrl.substring(0, 6);
  }

  async findByShortUrl(shortUrl: string): Promise<Url> {
    return this.urlsRepository.findOne({ where: { shortUrl } });
  }

  async incrementClicks(id: number): Promise<void> {
    await this.urlsRepository.increment({ id }, 'clicks', 1);
  }

  async findAllByUser(
    user: User,
  ): Promise<{ originalUrl: string; shortUrl: string }[]> {
    const urls = await this.urlsRepository.find({
      where: {
        user,
        expiresAt: MoreThanOrEqual(new Date()),
        deletedAt: null,
      },
      order: { createdAt: 'DESC' },
    });

    return urls.map((url) => ({
      originalUrl: url.originalUrl,
      shortUrl: `${this.domain}/${url.shortUrl}`,
      clicks: url.clicks,
      expiresAt: url.expiresAt,
    }));
  }

  async updateUrl(
    shortUrl: string,
    originalUrl: string,
    user: User,
  ): Promise<Url> {
    const url = await this.urlsRepository.findOne({
      where: { shortUrl, user },
    });
    if (!url) {
      throw new Error('URL not found or not owned by user');
    }
    url.originalUrl = originalUrl;
    url.updatedAt = new Date();
    url.expiresAt = new Date(
      url.updatedAt.setDate(url.updatedAt.getDate() + 120),
    );

    return this.urlsRepository.save(url);
  }

  async deleteUrl(shortUrl: string, user: User): Promise<void> {
    const url = await this.urlsRepository.findOne({
      where: { shortUrl, user },
    });

    if (!url) {
      throw new Error('URL not found or not owned by user');
    }

    url.deletedAt = new Date();
    url.expiresAt = new Date();
    await this.urlsRepository.save(url);
  }
}
