import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { Token } from 'src/user/token.entity';
import { Employee } from 'src/user/employee/employee.entity';


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
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = this.employeeRepository.create({
      username: username,
      fullname: fullName,
      email: email,
      password: hashedPassword,
    });
    const user = this.usersRepository.create({
      username: username,
      password: hashedPassword,
      role,
    });
    await this.employeeRepository.save(employee);
    await this.usersRepository.save(user);
    return user;
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
}
