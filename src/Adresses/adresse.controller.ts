import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AdresseService } from './adresse.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { AddressDTO } from './DTO/adress.dto';

@Controller('Adresse')
export class AdresseController {
  constructor(private adressservice: AdresseService) {}
  useraddress : any;

  @Post('Creat')
  @UseGuards(JwtAuthGuard)
  async Creat(@Req() req: Express.Request, @Body() adressepayload: AddressDTO) {
    await this.adressservice.create(req, adressepayload);
    return 'Address created';
  }

  @Get('Read')
  @UseGuards(JwtAuthGuard)
  async Read(@Req() req: Express.Request) {
    this.useraddress = this.adressservice.get(req);
    return this.useraddress;
  }
}
