import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryController } from './history.controller';
import { SearchHistory } from './history.entity';
import { HistoryService } from './history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchHistory]), 
  ],
  controllers: [HistoryController],
  providers: [HistoryService]
})
export class HistoryModule {
}

