import { Url } from '../../urls/entities/url.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  id: number;

  @Column({ length: 255 })
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  name: string;

  @Column({ length: 255, unique: true })
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @Column({ length: 255 })
  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  password: string;

  @Column({ default: true })
  @ApiProperty({ example: true, description: 'The active status of the user' })
  isActive: boolean;

  @OneToMany(() => Url, (url) => url.user)
  @ApiProperty({
    type: () => [Url],
    description: 'The URLs associated with the user',
  })
  urls: Url[];

  @Column({ default: new Date() })
  @ApiProperty({
    example: new Date(),
    description: 'The date the user was created',
  })
  created_at: Date;

  @Column({ default: new Date() })
  @ApiProperty({
    example: new Date(),
    description: 'The date the user was last updated',
  })
  updated_at: Date;

  @Column({ nullable: true })
  @ApiProperty({ example: null, description: 'The date the user was deleted' })
  deleted_at: Date;
}
