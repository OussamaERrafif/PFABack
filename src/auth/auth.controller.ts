import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { authdtopayload } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './guard/local.guard';
import { JwtAuthGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) {}
  @Post('login') // <== This is the route
  @UseGuards(LocalGuard) // <== This is the guard
  login(@Body() authpayload: authdtopayload) {
    const user = this.authservice.validateUser(authpayload);
    if (!user) {
      throw new HttpException('Invalid credentials', 401);
    }
    return user;
  }
  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Express.Request) {
    console.log('Inside AuthController status method');
    console.log(req.user);
    return req.user;
  }


}