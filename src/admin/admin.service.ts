import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async findAll(): Promise<Admin[]> {
    return await this.adminRepository.find();
  }

  async findOne(id: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id: Number(id) },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }

  async create(adminData: Partial<Admin>): Promise<Admin> {
    // Check if an admin with the given email already exists
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: adminData.email },
    });
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create a new admin entity with the hashed password
    const admin = this.adminRepository.create({
      ...adminData,
      password: hashedPassword,
    });

    return await this.adminRepository.save(admin);
  }

  async update(id: string, adminData: Partial<Admin>): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id: Number(id) },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    this.adminRepository.merge(admin, adminData);
    return await this.adminRepository.save(admin);
  }

  async remove(id: string): Promise<void> {
    const admin = await this.adminRepository.findOne({
      where: { id: Number(id) },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    await this.adminRepository.remove(admin);
  }
}
