import { Controller, Get, Patch, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

export enum TypeCreation {
  true = 'true',
  false = 'false',
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('collection')
  @ApiTags('View collection')
  async getCollection() {
    return await this.appService.getCollection();
  }
  @Patch('create/collection')
  @ApiTags('Create collection')
  @ApiQuery({ name: 'newCollection', required: false, enum: ['true', 'false'] })
  async createCollectionRFT(
    @Query('newCollection') newCollection: TypeCreation = TypeCreation.false,
  ): Promise<any> {
    return await this.appService.createCollection(newCollection);
  }

  @Patch('create/token')
  @ApiTags('Create token')
  async createRFT(@Query('amount') amount: number): Promise<any> {
    return await this.appService.createRFToken(amount);
  }
}
