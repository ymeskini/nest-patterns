import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Response } from 'express';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  async signUp(@Body() signupDto: SignUpDto) {
    return this.authenticationService.signUp(signupDto);
  }

  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signinDto: SignInDto,
  ) {
    const accessToken = await this.authenticationService.signIn(signinDto);
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return this.authenticationService.signIn(signinDto);
  }
}
