import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { Token } from 'src/user/token.entity';
import { Employee } from 'src/user/employee/employee.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Admin } from 'src/admin/admin.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Token) // Inject the Token repository
    private tokensRepository: Repository<Token>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
    public jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { username },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async createUserInfo(
    username: string,
    fullName: string,
    email: string,
    role: string,
  ): Promise<any> {
    const hashedPassword = await bcrypt.hash(username, 10);
    const employee = this.employeeRepository.create({
      username: username,
      fullname: fullName,
      email: email,
      role: role,
      password: hashedPassword,
    });
    const user = this.usersRepository.create({
      username: fullName,
      password: hashedPassword,
      role,
    });
    await this.employeeRepository.save(employee);
    await this.usersRepository.save(user);
    return employee;
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
      const existingEmployee = await this.usersRepository.findOne({
        where: { username },
      });
      if (existingEmployee) {
        throw new HttpException(
          'Employee with this username already exists',
          HttpStatus.CONFLICT,
        );
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
    const employee = await this.employeeRepository.findOne({
      where: { username },
    });
    if (!employee) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
    const { password, ...result } = employee;
    return result;
  }

  async updateUserInfo(
    username: string,
    fullName: string,
    email: string,
  ): Promise<any> {
    const employee = await this.employeeRepository.findOne({
      where: { username },
    });
    if (!employee) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
    employee.fullname = fullName;
    employee.email = email;
    await this.employeeRepository.save(employee);
    return employee;
  }

  async generateResetToken(email: string): Promise<string> {
    let user =
      (await this.adminsRepository.findOne({ where: { email } })) ||
      (await this.employeeRepository.findOne({ where: { email } }));

    if (!user) {
      throw new HttpException(
        'No account found with that email',
        HttpStatus.NOT_FOUND,
      );
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    await this.sendResetEmail(email, token);

    return token;
  }

  private async sendResetEmail(email: string, token: string): Promise<void> {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(
      `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    `,
    ); // Replace with your actual API key

    const mailOptions = {
      from: 'syntaxsquad02@gmail.com', // Sender address
      to: email, // List of receivers
      subject: 'Password Reset', // Subject line
      text: 'You requested a password reset. Follow this link to reset your password:', // Plain text body
      html: `<b>You requested a password reset.</b><br><a href="http://localhost:5173/ResetPassword?token=${token}">Reset Password</a>`, // HTML body content
    };

    sgMail
      .send(mailOptions)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let decoded;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      throw new HttpException(
        'Invalid or expired reset token',
        HttpStatus.FORBIDDEN,
      );
    }

    const userCondition = { id: decoded.sub };
    let user =
      (await this.adminsRepository.findOne({ where: userCondition })) ||
      (await this.employeeRepository.findOne({ where: userCondition }));

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.password = newPassword; // Ensure password hashing is handled
    if (user instanceof Admin) {
      await this.adminsRepository.save(user);
    } else {
      await this.employeeRepository.save(user);
    }
  }
}
