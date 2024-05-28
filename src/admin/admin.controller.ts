import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { LocalGuard } from 'src/auth/guard/local.guard';
import { AuthService } from 'src/auth/auth.service';
import { Admindtopayload } from './DTO/admin.dto';
import { AdminLocalGuard } from './Guard/adminlocal.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { EmployeeDto } from 'src/auth/dto/employee.dto';
import { UpdateDTO } from './DTO/update.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private authservice: AuthService,
  ) {}

  // @Get()
  // getAll(): Promise<Admin[]> {
  //   return this.adminService.findAll();
  // }

  // @Get(':id')
  // getOne(@Param('id') id: string): Promise<Admin> {
  //   return this.adminService.findOne(id);
  // }

  @Post()
  create(@Body() admin: Admin): Promise<Admin> {
    return this.adminService.create(admin);
  }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() admin: Admin): Promise<Admin> {
  //   return this.adminService.update(id, admin);
  // }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.adminService.remove(id);
  }
  @Post('login')
  @UseGuards(AdminLocalGuard)
  async login(@Body() adminpayload: Admindtopayload) {
    const admin = await this.adminService.login(
      adminpayload.username,
      adminpayload.password,
    );

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

    return { access_token: token , role: 'admin'};
  }

  @Post('signup')
  async signUp(@Body() adminData: Admin): Promise<Admin> {
    console.log('Inside AdminController signUp method');
    return this.adminService.signUp(adminData);
  }
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Req() req: Express.Request & { user: { username: string } }): Promise<any> {
    return this.adminService.getStatus(req.user.username);
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: Express.Request & { user: { username: string } }, @Body() admindto: Admindtopayload): Promise<Admin> {
    return this.adminService.update(req.user.username, admindto.fullname, admindto.email);
  }

  @Get('allUsers')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@Req() req: Express.Request & { user: { username: string } }): Promise<any> {
    return this.adminService.getAllUsers(req.user.username);
  }

  //get user by username
  @Get('getUser/:username')
  async getUser( @Param('username') username: string): Promise<any> {
    console.log('Inside getUser method');
    return this.adminService.getUser(username);
  }
  @Post('createuser')
  @UseGuards(JwtAuthGuard)
  async createuser(@Req() req: Express.Request & { user: { username: string } }, @Body() userdto: UpdateDTO) {
    return await this.authservice.createUserInfo(userdto.username, userdto.fullname, userdto.email, userdto.role );
  }

  @Delete('deleteuser/:id')
  async deleteuser( @Param('id') username: string) {
    return await this.adminService.deleteUser(username);
  }

  @Post('updateuser/:username')
  async updateUser(@Req() req: Express.Request & { user: { username: string } }, @Body() userDto: UpdateDTO , @Param('username') username: string ){
    return await this.adminService.updateUser(username, userDto.role, userDto.email,userDto.fullname , userDto.addresses );
  }

}
