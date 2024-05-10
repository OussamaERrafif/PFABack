import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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
  stats :any;
  @Post('login')
  // @UseGuards(LocalGuard)
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

    return { access_token: token , role: user.role};
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
  status(@Req() req: Express.Request & { user: { username: string } }) {
    console.log('Inside AuthController status method');
    console.log(req.user);
    this.stats = this.authservice.getUserInfo(req.user.username);
    return this.stats;
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: Express.Request & { user: { username: string } }, @Body() employeeDto: EmployeeDto) {
    return await this.authservice.updateUserInfo(req.user.username, employeeDto.fullname, employeeDto.email);
  }
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<any> {
    try {
      await this.authservice.generateResetToken(email);
      return { message: 'If an account with that email exists, a reset email has been sent.' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }): Promise<any> {
    try {
      await this.authservice.resetPassword(body.token, body.newPassword);
      return { message: 'Password has been successfully reset.' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
