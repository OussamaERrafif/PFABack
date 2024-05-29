import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Token } from 'src/user/token.entity';
import { User } from 'src/user/user.entity';
import e from 'express';
import { Address } from 'src/Adresses/Entity/adress.entity';
import { Employee } from 'src/user/employee/employee.entity';
import { LogsService } from 'src/journal/logs.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Token) // Inject the Token repository
    private tokensRepository: Repository<Token>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    public jwtService: JwtService,
    private logsService : LogsService,
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
    this.logsService.createLog(adminData.username, 'Create', 'Admin created', 'Success');
    await this.userRepository.save(user);
    await this.adminRepository.save(admin);
    return admin;
  }

  async update(username: string, fullname : string ,emmail:string): Promise<any> {
    const admin = await this.adminRepository.findOne({
      where: { username: username },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${username} not found`);
    }
    admin.fullname = fullname;
    admin.email = emmail;
    this.adminRepository.save(admin);
    this.logsService.createLog(username, 'Update', 'Admin updated', 'Success');
    return admin;
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
    this.logsService.createLog(admin.username, 'Delete', 'Admin deleted', 'Success');
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
    this.logsService.createLog(adminData.username, 'Create', 'Admin created', 'Success');
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
      this.logsService.createLog(username, 'Login', 'Admin logged in', 'Success');
      return result;
    }
    return null;
  }


  // async getUserInfo(username: string): Promise<any> {
  //   const employee = await this.employeeRepository.findOne({
  //     where: { username },
  //   });
  //   if (!employee) {
  //     throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
  //   }
  //   const { password, ...result } = employee;
  //   return result;
  // }
  //do the same for admin
  async getStatus(username: string): Promise<any> {
    const employee = await this.adminRepository.findOne({
          where: { username },
        });
        if (!employee) {
          throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
        }
        const { password, ...result } = employee;
        this.logsService.createLog(username, 'Get', 'Admin status', 'success');
        return result;
  }

  async getAllUsers(username: string): Promise<any[]> {
    // Check if the username has admin role or other
    const user = await this.userRepository.findOne({
      where: { username },
    });
  
    if (!user) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
  
    if (user.role !== 'admin') {
      throw new UnauthorizedException('You are not authorized to view this page');
    }
  
    const users = await this.userRepository.find();
    const addresses = await this.addressRepository.find();
    const admins = await this.adminRepository.find();
    const employees = await this.employeeRepository.find();
  
    const result = [];
  
    for (let i = 0; i < users.length; i++) {
      const userAddress = addresses.find((address) => address.username === users[i].username);
      const admin = admins.find((admin) => admin.username === users[i].username);
      const employee = employees.find((employee) => employee.username === users[i].username);
  
      if (admin || employee) {
        const userData = admin || employee;
        const { password, ...userWithoutPassword } = userData;
        const address = {
          street: userAddress ? userAddress.street : '',
          city: userAddress ? userAddress.city : '',
          state: userAddress ? userAddress.state : '',
          postalCode: userAddress ? userAddress.postalCode : '',
        };
  
        result.push({
          username: users[i].username,
          role: users[i].role,
          email: userData.email,
          fullname: userData.fullname,
          addresses: address,
        });
      }
    }
  
    return result;
  }
  
  //get user by username
  async getUser(username: string): Promise<any> {
    // Fetch the user from the database
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    // Fetch additional details based on the user's role
    const userDetails = await this.employeeRepository.findOne({ where: { username } }) || await this.adminRepository.findOne({ where: { username } });
    if (!userDetails) {
      throw new HttpException('User details not found', HttpStatus.NOT_FOUND);
    }
  
    // Fetch the user's address details
    let address = await this.addressRepository.findOne({ where: { username } });
    if (!address) {
      address = {username: username, street: '', city: '', state: '', postalCode: '' };
    }
  
    return { user, userDetails, address };
  }

  async updateUser(username: string, role: string, email: string, fullName: string, addresses: {  city: string, state: string, postalCode: string }): Promise<any> {
    // Fetch the user from the database
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    // Update basic user properties
    user.role = role;
    await this.userRepository.save(user);
  
    // Assuming 'Employee' and 'Admin' are updated similarly
    const userDetails = await this.employeeRepository.findOne({ where: { username } }) || await this.adminRepository.findOne({ where: { username } });
    if (userDetails) {
      userDetails.fullname = fullName;
      userDetails.email = email;
      await this.employeeRepository.save(userDetails);
    }
  
    // Update or insert address details
    const address = await this.addressRepository.findOne({ where: { username } });
    if (address) {
      address.city = addresses.city || '';
      address.state = addresses.state || '';
      address.postalCode = addresses.postalCode  || '';
      await this.addressRepository.save(address);
    } else {
      await this.addressRepository.insert({ username, ...addresses });
    }
    this.logsService.createLog(username, 'Update', 'User updated', 'Success');
  
    return { user, userDetails, addresses };
  }
  

  async deleteUser(username: string): Promise<void> {
    // Retrieve the user by username
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    // Depending on the user's role, delete the user from corresponding tables
    if (user.role === 'admin') {
      // Assuming admin might have specific additional records
      const admin = await this.adminRepository.findOne({ where: { username } });
      if (admin) {
        await this.adminRepository.remove(admin);
      }else{
        throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
      }
    } else if (user.role === 'employee') {
      // Similar for employee
      const employee = await this.employeeRepository.findOne({ where: { username } });
      if (employee) {
        await this.employeeRepository.remove(employee);
      }else{
        throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
      }
    }
  
    // Delete user addresses if applicable
    const addresses = await this.addressRepository.find({ where: { username } });
    addresses.forEach(async (address) => {
      await this.addressRepository.remove(address);
    });
    this.logsService.createLog(username, 'Delete', 'User deleted', 'Success');
    // Finally, delete the user record
    await this.userRepository.remove(user);
  }
  
  
}
