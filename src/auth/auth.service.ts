import { Injectable } from '@nestjs/common';
import { authdtopayload } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

// const fakeUsers = [
//   { id: 1, username: 'admin', password: 'admin', role: 'admin' },
//   { id: 2, username: 'user', password: 'password', role: 'employee' },
//   { id: 3, username: 'user3', password: 'password3', role: 'employee' },
// ];

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
    }
    return null;
}

  async signUp(username: string, password: string, role: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      role,
    });
    await this.usersRepository.save(user);
    return user;
  }

  logout() {
    // Logique de déconnexion ici
    // Pour l'exemple, nous retournons simplement un message
    return 'Logged out successfully';
  }
async adminLogin({ username, password }: authdtopayload) {
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid username or password');
    }

    if (user.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized access');
    }

    const payload = {
        username: user.username,
        sub: user.password,
        role: user.role,
    };

    return this.jwtService.sign(payload);
}
}
