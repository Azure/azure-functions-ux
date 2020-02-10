import { Module } from '@nestjs/common';
import { StaticSitesController } from './staticsites.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [StaticSitesController],
  providers: [],
})
export class StaticSitesModule {}
