import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Token } from 'src/user/token.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Token) // Inject the Token repository
    private tokensRepository: Repository<Token>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      where: { username: adminData.username },
    });
    if (existingAdmin) {
      throw new ConflictException('Admin with this username already exists');
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const admin = this.adminRepository.create({
      ...adminData,
      password: hashedPassword,
    });
    const user = this.userRepository.create({
      username: adminData.username,
      password: hashedPassword,
      role : 'admin',
    });
    await this.userRepository.save(user);
    await this.adminRepository.save(admin);
    return admin;
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
    const existingAdmin = await this.adminRepository.findOne({
      where: { username: adminData.username },
    });
    if (existingAdmin) {
      throw new ConflictException('Admin with this username already exists');
    }

    // Regex pattern to validate username (name) format
    const nameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!nameRegex.test(adminData.username)) {
      throw new BadRequestException('Invalid username format');
    }

    // Regex pattern to validate password format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(adminData.password)) {
      throw new BadRequestException('Invalid password format');
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const admin = this.adminRepository.create({
      ...adminData,
      password: hashedPassword,
    });

    const user = this.userRepository.create({
      username: adminData.username,
      password: hashedPassword,
      role : 'admin',
    });
    await this.userRepository.save(user);
    await this.adminRepository.save(admin);
    return admin;
  }

  
  async login(username: string, password: string): Promise<any> {
    // Regex pattern to validate username (name) format
    const nameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!nameRegex.test(username)) {
      throw new BadRequestException('Invalid username format');
    }

    const admin = await this.adminRepository.findOne({ where: { username } });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }
}
