import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  Res,
  Optional,
  Put,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';

@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('shorten')
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

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllByUser(@GetUser() user: User) {
    return this.urlsService.findAllByUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUrl(
    @Param('id') id: number,
    @Body('url') url: string,
    @GetUser() user: User,
  ) {
    return this.urlsService.updateUrl(id, url, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUrl(@Param('id') id: number, @GetUser() user: User) {
    return this.urlsService.deleteUrl(id, user);
  }
}
