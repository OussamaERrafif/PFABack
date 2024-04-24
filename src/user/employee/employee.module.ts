import { forwardRef, Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { UserModule } from '../user.module';
import { UserService } from '../user.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [EmployeeService, UserService],
})
export class EmployeeModule {}
