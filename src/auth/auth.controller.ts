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
import { RoleGuard } from './guard/role.guard';

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
  @Post('signup')
  signUp(@Body() authPayload: authdtopayload) {
    return this.authservice.signUp(authPayload);
  }

  @Get('logout')
  logout() {
    return this.authservice.logout();
  }
  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Express.Request) {
    console.log('Inside AuthController status method');
    console.log(req.user);
    return req.user;
  }
  @Post('admin')
  async admin(@Body() user: any) {
    return this.authservice.adminLogin(user);
  }
}
