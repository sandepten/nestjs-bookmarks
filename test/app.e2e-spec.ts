import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { SignInInput, SignUpInput } from 'src/auth/dto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  // beforeAll is a hook that will run before all the tests in this test suite
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    // We need to use the same validation pipe as the one used in the main.ts file
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    await app.listen(4001);
    // this is a hack to make sure that the database is empty before running the tests
    prisma = app.get(PrismaService);
    await prisma.cleanup();
    pactum.request.setBaseUrl('http://localhost:4001');
  });
  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      const dto: SignUpInput = {
        email: 'sandepten@gmail.com',
        name: 'Sandeep',
        password: '12345678',
      };
      it('should throw if no email is provided', () => {
        const dto: SignUpInput = {
          email: '',
          password: '12345678',
          name: 'Sandeep',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });
      it('should create a new user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
      it('should not create a new user if the email is already taken', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(403);
      });
    });
    describe('Signin', () => {
      const dto: SignInInput = {
        email: 'sandepten@gmail.com',
        password: '12345678',
      };
      it('should signin a user', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201);
      });
      it('should not signin a user if the email is not registered', () => {
        const dto: SignInInput = {
          email: 'shivani@gmail.com',
          password: '12345678',
        };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(403);
      });
      it('should not signin a user if the password is incorrect', () => {
        const dto: SignInInput = {
          email: 'sandepten@gmail.com',
          password: 'abcdefgh',
        };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(403);
      });
    });
  });

  describe('User', () => {
    describe('Get User', () => {});
    describe('Update User', () => {});
    describe('Delete User', () => {});
  });

  describe('Bookmarks', () => {
    describe('Get Bookmarks', () => {});
    describe('Get Bookmark by id', () => {});
    describe('Create Bookmark', () => {});
    describe('Update Bookmark', () => {});
    describe('Delete Bookmark', () => {});
  });
});
