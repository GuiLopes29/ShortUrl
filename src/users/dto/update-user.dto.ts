import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'The name of the user',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiPropertyOptional({
    example: 'password123',
    description: 'The password of the user',
  })
  password: string;
}
