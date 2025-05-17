import { Alarm } from '../../domain/alarm';

export abstract class AlarmRepository {
  abstract findAll(): Promise<Alarm[]>;
  abstract save(alarm: Alarm): Promise<Alarm>;
}

// we use abstract classes here instead of interfaces
// because in nestjs classes are used as tokens to be identified
