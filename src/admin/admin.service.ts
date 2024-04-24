import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Token } from 'src/user/token.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Token) // Inject the Token repository
    private tokensRepository: Repository<Token>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    public jwtService: JwtService,
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
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: adminData.email },
    });
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

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
  async saveToken(token: string, role: string): Promise<Token> {
    const newToken = this.tokensRepository.create({ token, role });
    await this.tokensRepository.save(newToken);
    return newToken;
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

  async signUp(adminData: Admin): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const newAdmin = this.adminRepository.create({
      ...adminData,
      password: hashedPassword,
    });

    return this.adminRepository.save(newAdmin);
  }

  
  async login(name: string, password: string): Promise<any> {
    const admin = await this.adminRepository.findOne({ where: { name } });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }
}
