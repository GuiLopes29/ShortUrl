import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    private configService: ConfigService,
  ) {
    this.domain =
      this.configService.get<string>('DOMAIN') ||
      `http://localhost:${this.configService.get<number>('PORT')}`;
  }

  async shortenUrl(originalUrl: string, user?: User): Promise<string> {
    const shortUrl = this.generateShortUrl();
    const url = this.urlsRepository.create({ originalUrl, shortUrl, user });
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
}
