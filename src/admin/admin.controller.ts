import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  getAll(): Promise<Admin[]> {
    return this.adminService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<Admin> {
    return this.adminService.findOne(id);
  }

  @Post()
  create(@Body() admin: Admin): Promise<Admin> {
    return this.adminService.create(admin);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() admin: Admin): Promise<Admin> {
    return this.adminService.update(id, admin);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.adminService.remove(id);
  }
}