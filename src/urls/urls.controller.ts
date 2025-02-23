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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('URLs')
@Controller()
export class UrlsController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('shorten')
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiResponse({
    status: 201,
    description: 'The URL has been successfully shortened.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async shortenUrl(
    @Body('url') url: string,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      let user: User | undefined;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        const decoded = this.jwtService.decode(token) as {
          sub: number;
          email: string;
        };
        user = new User();
        user.id = decoded.sub;
        user.email = decoded.email;
      }
      return await this.urlsService.shortenUrl(url, user);
    } catch (error) {
      throw new HttpException(
        'Failed to shorten URL' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':shortUrl')
  @ApiOperation({ summary: 'Redirect to the original URL' })
  @ApiResponse({ status: 302, description: 'Redirecting to the original URL.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  async redirect(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    try {
      const url = await this.urlsService.findByShortUrl(shortUrl);
      if (url) {
        await this.urlsService.incrementClicks(url.id);
        return res.redirect(url.originalUrl);
      } else {
        return res.status(404).json({ message: 'URL not found' });
      }
    } catch (error) {
      throw new HttpException(
        'Failed to redirect' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all URLs for the user' })
  @ApiResponse({ status: 200, description: 'Return all URLs for the user.' })
  async findAllByUser(@GetUser() user: User) {
    try {
      return await this.urlsService.findAllByUser(user);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve URLs' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':shortUrl')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the original URL of a shortened URL' })
  @ApiResponse({
    status: 200,
    description: 'The URL has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  async updateUrl(
    @Param('shortUrl') shortUrl: string,
    @Body('url') url: string,
    @GetUser() user: User,
  ) {
    try {
      return await this.urlsService.updateUrl(shortUrl, url, user);
    } catch (error) {
      throw new HttpException(
        'Failed to update URL' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':shortUrl')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a shortened URL' })
  @ApiResponse({
    status: 200,
    description: 'The URL has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  async deleteUrl(@Param('shortUrl') shortUrl: string, @GetUser() user: User) {
    try {
      return await this.urlsService.deleteUrl(shortUrl, user);
    } catch (error) {
      throw new HttpException(
        'Failed to delete URL' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
