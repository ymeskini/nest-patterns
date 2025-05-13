import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCoffeeDto {
  @ApiProperty({ description: 'The name of the coffee' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The brand of the coffee' })
  @IsString()
  readonly brand: string;

  @ApiProperty({
    description: 'The flavors of the coffee',
    example: ['chocolate', 'vanilla'],
  })
  @IsString({ each: true })
  readonly flavors: string[];
}
