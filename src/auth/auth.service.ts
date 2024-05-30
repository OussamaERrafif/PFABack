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
import { LogsService } from 'src/journal/logs.service';

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
    public logsService: LogsService,
  ) {}

  mailtoken: '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';

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
    fullname: string,
    email: string,
    role: string,
  ): Promise<any> {
    console.log('Input Parameters:', { username, fullname, email, role });

    if (!username || !fullname || !email || !role) {
      console.error('Invalid input parameters');
      throw new HttpException(
        'Invalid input parameters',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const existingEmployee = await this.employeeRepository.findOne({
        where: { email },
      });
      if (existingEmployee) {
        console.error('Email already exists:', email);
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const existingUser = await this.usersRepository.findOne({
        where: { username },
      });
      if (existingUser) {
        console.error('Username already exists:', username);
        throw new HttpException('Username already exists', HttpStatus.CONFLICT);
      }

      const defaultPassword = Math.random().toString(36).substring(2, 10);
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      let createdUser: any;

      if (role === 'admin') {
        const admin = this.adminsRepository.create({
          username,
          fullname,
          email,
          password: hashedPassword,
        });
        await this.adminsRepository.save(admin);
        const user = this.usersRepository.create({
          username,
          password: hashedPassword,
          role,
        });
        await this.usersRepository.save(user);
        createdUser = admin;
      } else {
        const employee = this.employeeRepository.create({
          username,
          fullname,
          email,
          role,
          password: hashedPassword,
        });
        await this.employeeRepository.save(employee);
        const user = this.usersRepository.create({
          username,
          password: hashedPassword,
          role,
        });
        await this.usersRepository.save(user);
        createdUser = employee;
      }

      // Log the default password instead of sending an email
      console.log(`Default password for ${username} is: ${defaultPassword}`);

      // Send an email to the user
      this.sendEmail(email, username, defaultPassword);
      return { createdUser, defaultPassword };
    } catch (error) {
      console.error('An error occurred while creating the user info:', error);
      throw new HttpException(
        'An error occurred while creating the user info: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      this.logsService.createLog(username, 'Create', 'User created', 'success');
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
    this.logsService.createLog(username, 'Get', 'employee status', 'success');
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
    this.logsService.createLog(username, 'Update', 'User updated', 'success');
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
      `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`,
    ); // Replace with your actual API key

    const mailOptions = {
      from: 'syntaxsquad02@gmail.com', // Sender address
      to: email, // List of receivers
      subject: 'Password Reset', // Subject line
      text: 'You requested a password reset. Follow this link to reset your password:', // Plain text body
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); text-align: center;">
        <p style="font-size: 16px; color: #333333; font-weight: bold;">You requested a password reset.</p>
        <p style="text-align: center;">
            <a href="http://localhost:5173/ResetPassword?token=${token}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Reset Password</a>
        </p>
    </div>
</div>
      `, // HTML body content
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

  //send email to user
  async sendEmail(
    email: string,
    username: string,
    defaultPassword: string,
  ): Promise<void> {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(
      `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`,
    ); // Replace with your actual API key

    const mailOptions = {
      from: 'syntaxsquad02@gmail.com', // Sender address
      to: email, // List of receivers
      subject: 'Welcome to the team', // Subject line
      text: 'You requested a password reset. Follow this link to reset your password:', // Plain text body
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #333333; text-align: center;">Welcome to the team</h1>
        <p style="font-size: 16px; color: #555555;">Dear ${username},</p>
        <p style="font-size: 16px; color: #555555;">Thank you for joining our team. We are excited to have you on board.</p>
        <p style="font-size: 16px; color: #555555;">Your default password is <b style="font-size: 20px; color: #555555;"> ${defaultPassword}</b> do not share it to anyone</p>
        <p style="font-size: 16px; color: #555555;">If you want to reset your password, click on the link below:</p>
        <p style="text-align: center;">
            <a href="http://localhost:5173/forgotpassword" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </p>
        <p style="font-size: 16px; color: #555555;">Best regards,</p>
        <p style="font-size: 16px; color: #555555;">The Team</p>
    </div>
</div>
      `, // HTML body content
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
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    let userInUserRepo = await this.usersRepository.findOne({
      where: { username: user.username },
    });

    if (userInUserRepo) {
      // Update the user password in the user repository
      userInUserRepo.password = hashedPassword;
      // Save the updated user entity back to the repository
      await this.usersRepository.save(userInUserRepo);
    }

    if (user instanceof Admin) {
      this.logsService.createLog(
        user.username,
        'Update',
        'Password updated',
        'success',
      );
      await this.adminsRepository.save(user);
    } else {
      this.logsService.createLog(
        user.username,
        'Update',
        'Password updated',
        'success',
      );
      await this.employeeRepository.save(user);
    }
  }
}
