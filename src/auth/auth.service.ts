import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInInput, SignUpInput } from './dto';
@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
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
    return { token: await this.signToken(user.id, user.email) };
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
    return { token: await this.signToken(user.id, user.email) };
  }

  signToken(userId: number, email: string) {
    // generate the JWT token
    const token = this.jwt.signAsync(
      { sub: userId, email },
      { expiresIn: '1d', secret: this.config.get('JWT_SECRET') },
    );
    // return the token
    return token;
  }
}
