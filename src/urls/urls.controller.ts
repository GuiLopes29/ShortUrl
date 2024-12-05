import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  Optional,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('urls/shorten')
  async shortenUrl(
    @Body('url') url: string,
    @Optional() @GetUser() user?: User,
  ) {
    return this.urlsService.shortenUrl(url, user);
  }

  @Get(':shortUrl')
  async redirect(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    const url = await this.urlsService.findByShortUrl(shortUrl);
    if (url) {
      await this.urlsService.incrementClicks(url.id);
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json({ message: 'URL not found' });
    }
  }
}
