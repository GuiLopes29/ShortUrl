export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  urls: string;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
}
