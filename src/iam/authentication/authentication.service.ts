import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';

import { User } from '../../users/entities/user.entity';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signupDto: SignUpDto) {
    try {
      const user = new User();
      user.email = signupDto.email;
      user.password = await this.hashingService.hash(signupDto.password);

      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException();
      }
      throw error;
    }
  }

  async signIn(signinDto: SignUpDto) {
    const user = await this.userRepository.findOne({
      where: { email: signinDto.email },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.hashingService.compare(
      signinDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: this.jwtConfiguration.accessTokenTtl,
        secret: this.jwtConfiguration.secret,
      },
    );

    return {
      accessToken,
    };
  }
}
