import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmRepository } from '../../../application/ports/alarm.repository';
import { AlarmEntity } from './entities/alarm.entity';
import { InMemoryAlarmRepository } from './repositories/alarm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AlarmEntity])],
  providers: [
    {
      provide: AlarmRepository,
      useClass: InMemoryAlarmRepository, // 💡 This is where we bind the port to an adapter
    },
  ],
  exports: [AlarmRepository],
})
export class InMemoryAlarmPersistenceModule {}
