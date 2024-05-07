import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { LocalGuard } from 'src/auth/guard/local.guard';
import { AuthService } from 'src/auth/auth.service';
import { Admindtopayload } from './DTO/admin.dto';
import { AdminLocalGuard } from './Guard/adminlocal.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService,private authservice: AuthService) {}

  // @Get()
  // getAll(): Promise<Admin[]> {
  //   return this.adminService.findAll();
  // }

  // @Get(':id')
  // getOne(@Param('id') id: string): Promise<Admin> {
  //   return this.adminService.findOne(id);
  // }

  // @Post()
  // create(@Body() admin: Admin): Promise<Admin> {
  //   return this.adminService.create(admin);
  // }

  @Put(':id')
  update(@Param('id') id: string, @Body() admin: Admin): Promise<Admin> {
    return this.adminService.update(id, admin);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.adminService.remove(id);
  }
  @Post('login')
  
  @UseGuards(AdminLocalGuard)
  async login(@Body() adminpayload: Admindtopayload) {
    const admin = await this.adminService.login(adminpayload.username, adminpayload.password);

    if (!admin) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      username: admin.username,
      password: admin.password,
      email: admin.email,
    };
    const token = this.adminService.jwtService.sign(payload);

    // Save the token
    await this.adminService.saveToken(token, 'admin');

    return { access_token: token };
  }

  @Post('signup')
  async signUp(@Body() adminData: Admin): Promise<Admin> {
    console.log('Inside AdminController signUp method');
    return this.adminService.signUp(adminData);
  }
}