import { Injectable } from '@nestjs/common';
import { authdtopayload } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

const fakeUsers = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin' },
  { id: 2, username: 'user', password: 'password', role: 'employee' },
  { id: 3, username: 'user3', password: 'password3', role: 'employee' },
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  validateUser({ username, password }: authdtopayload) {
    const user = fakeUsers.find(
      (user) => user.username === username && user.password === password,
    );
    if (!user) {
      return null;
    }
    if (password == user.password) {
      const { password, ...result } = user;
      return this.jwtService.sign(result);
    }
  }
  signUp({ username, password }: authdtopayload) {
    const existingUser = fakeUsers.find((user) => user.username === username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const newUser = {
      id: fakeUsers.length + 1,
      username,
      password,
      role: 'employee',
    };
    fakeUsers.push(newUser);

    return newUser;
  }

  logout() {
    // Logique de déconnexion ici
    // Pour l'exemple, nous retournons simplement un message
    return 'Logged out successfully';
  }
  async adminLogin({ username, password }: authdtopayload) {
    const user = fakeUsers.find(
      (user) => user.username === username && user.password === password,
    );

    if (!user) {
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
