import { Injectable } from '@nestjs/common';
import { authdtopayload } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

const fakeUsers = [
    { id: 1, username: 'user1', password: 'password1' },
    { id: 2, username: 'user2', password: 'password2' },
    { id: 3, username: 'user3', password: 'password3' },
];

@Injectable()
export class AuthService {
    constructor(private jwtService : JwtService) {}
    validateUser({ username, password}:authdtopayload){
        const user = fakeUsers.find(user => user.username === username && user.password === password);
        if(!user){return null;}
        if(password == user.password){
            const {password, ...result} = user;
            return this.jwtService.sign(result);
        }
     
    }
    signUp({ username, password }: authdtopayload) {
        const existingUser = fakeUsers.find(user => user.username === username);
        if (existingUser) {
            throw new UnauthorizedException('Username already exists');
        }

        const newUser = { id: fakeUsers.length + 1, username, password };
        fakeUsers.push(newUser);

        return newUser;
    }

    logout() {
        // Logique de déconnexion ici
        // Pour l'exemple, nous retournons simplement un message
        return 'Logged out successfully';
    }
}
