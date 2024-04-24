

import { Module } from '@nestjs/common';
import { EmployeeModule } from './employee/employee.module';
import { UserService } from './user.service';

@Module({
    imports: [EmployeeModule],
    controllers: [],
    providers: [UserService],
})
export class UserModule {}
