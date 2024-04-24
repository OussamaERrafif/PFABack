import { Injectable } from '@nestjs/common';
import { UserService } from '../user.service';

@Injectable()
export class EmployeeService {
  constructor(private readonly userService: UserService) {}
}
