import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInInput, SignUpInput } from './dto';
@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signUp(data: SignUpInput) {
    // check if the user already exists
    const userExists = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    // if the user exists
    if (userExists) throw new ForbiddenException('User already exists');
    // generate the password hash
    const hash = await argon.hash(data.password);
    // create the user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hash,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    // return the saved user
    return user;
  }

  async signIn(data: SignInInput) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    // if the user does not exist
    if (!user) throw new ForbiddenException('Invalid email or password');
    // compare the password hash with the provided password
    const valid = await argon.verify(user.password, data.password);
    // if the password is not valid
    if (!valid) throw new ForbiddenException('Invalid email or password');
    // return the user
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
