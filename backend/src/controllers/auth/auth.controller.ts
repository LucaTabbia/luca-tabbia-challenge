import { Body, Controller, Post } from '@nestjs/common';
import { Mapper } from '@/utils/mapper/mapper';
import { AuthService } from '@/services/users/auth.service';
import { AuthRequestDto } from '@/dtos/auth-request.dto';
import { AuthResponseDto, IAuthResponseDto } from '@/dtos/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: AuthRequestDto): Promise<IAuthResponseDto> {
    const entity = await this.authService.signUp(body);
    return Mapper.mapData(AuthResponseDto, entity);
  }

  @Post('signin')
  async signIn(@Body() body: AuthRequestDto): Promise<IAuthResponseDto> {
    const entity = await this.authService.signIn(body);
    return Mapper.mapData(AuthResponseDto, entity);
  }
}
