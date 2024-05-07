import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { Token } from 'src/user/token.entity';
import { Employee } from 'src/user/employee/employee.entity';
import { HttpException, HttpStatus } from '@nestjs/common';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Token) // Inject the Token repository
    private tokensRepository: Repository<Token>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    public jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const employee = await this.employeeRepository.findOne({ where: { username } });
    if (employee && (await bcrypt.compare(password, employee.password))) {
      const { password, ...result } = employee;
      return result;
    }
    return null;
  }

  async signUp(
    username: string,
    fullName: string,
    email: string,
    password: string,
    role: string = 'employee',
  ): Promise<any> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const existingEmployee = await this.usersRepository.findOne({ where: { username } });
      if (existingEmployee) {
        throw new HttpException('Employee with this username already exists', HttpStatus.CONFLICT);
      }

      const employee = this.employeeRepository.create({
        fullname: username,
        username: fullName,
        email: email,
        password: hashedPassword,
      });
      const user = this.usersRepository.create({
        username: fullName,
        password: hashedPassword,
        role,
      });
      await this.employeeRepository.save(employee);
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  async saveToken(token: string, role: string): Promise<Token> {
    const newToken = this.tokensRepository.create({ token, role });
    await this.tokensRepository.save(newToken);
    return newToken;
  }
  

  logout() {
    // Logique de déconnexion ici
    // Pour l'exemple, nous retournons simplement un message
    return 'Logged out successfully';
  }

  async getUserInfo(username: string): Promise<any> {
  const employee = await this.employeeRepository.findOne({ where: { username } });
  if (!employee) {
    throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
  }
  const { password, ...result } = employee;
  return result;
}
}
