import { Controller, Get, Put, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';

// we can also move the @UseGuards(JwtGuard) to the single route level
@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: { userId: number; email: string }) {
    return this.userService.getUser(user.email);
  }

  // @Put('update')
  // updateMe(@GetUser() user: { email: string }) {
  //   return this.userService.updateUser(user.email);
  // }
}
