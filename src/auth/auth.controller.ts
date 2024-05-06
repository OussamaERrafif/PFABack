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
import { EmployeeDto } from './dto/employee.dto';

@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) {}
  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Body() authpayload: authdtopayload) {
    const user = await this.authservice.validateUser(
      authpayload.username,
      authpayload.password,
    );
    if (!user) {
      throw new HttpException('Invalid credentials', 401);
    }

    const payload = {
      username: user.username,
      sub: user.userId,
      role: user.role,
    };
    const token = this.authservice.jwtService.sign(payload);

    await this.authservice.saveToken(token, user.role); 

    return { access_token: token };
  }
  @Post('signup')
  async signUp(@Body() employeeDto: EmployeeDto) {
    return await this.authservice.signUp(
      employeeDto.fullname,
      employeeDto.username,
      employeeDto.email,
      employeeDto.password,
    );
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
}
