// a value object should be immutable
// and should not have any side effects

export class AlarmSeverity {
  constructor(readonly value: 'critical' | 'high' | 'medium' | 'low') {}

  equals(other: AlarmSeverity): boolean {
    return this.value === other.value;
  }
}
