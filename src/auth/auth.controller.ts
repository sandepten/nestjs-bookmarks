import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInInput, SignUpInput } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() body: SignUpInput) {
    return this.authService.signUp(body);
  }

  @Post('signin')
  signIn(@Body() body: SignInInput) {
    return this.authService.signIn(body);
  }
}
