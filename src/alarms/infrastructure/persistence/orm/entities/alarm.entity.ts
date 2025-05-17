import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('alarms')
export class AlarmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  severity: string;
}
