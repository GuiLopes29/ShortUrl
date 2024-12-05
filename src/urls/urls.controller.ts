import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  Res,
  Put,
  Headers,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class UrlsController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('shorten')
  async shortenUrl(
    @Body('url') url: string,
    @Headers('authorization') authHeader: string,
  ) {
    let user: User | undefined;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.decode(token) as {
        sub: string;
        email: string;
      };

      user = new User();
      user.email = decoded?.email;
    }
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

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllByUser(@GetUser() user: User) {
    return this.urlsService.findAllByUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':shortUrl')
  async updateUrl(
    @Param('shortUrl') shortUrl: string,
    @Body('url') url: string,
    @GetUser() user: User,
  ) {
    return this.urlsService.updateUrl(shortUrl, url, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':shortUrl')
  async deleteUrl(@Param('shortUrl') shortUrl: string, @GetUser() user: User) {
    return this.urlsService.deleteUrl(shortUrl, user);
  }
}
