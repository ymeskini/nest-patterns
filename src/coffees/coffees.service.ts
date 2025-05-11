import { Injectable } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
  private readonly coffees: Coffee[] = [
    {
      id: 1,
      name: 'Arabica',
      brand: 'Brand A',
      flavors: ['Fruity', 'Floral'],
    },
    {
      id: 2,
      name: 'Robusta',
      brand: 'Brand B',
      flavors: ['Nutty', 'Chocolate'],
    },
    {
      id: 3,
      name: 'Liberica',
      brand: 'Brand C',
      flavors: ['Woody', 'Smoky'],
    },
  ];

  findAll() {
    return this.coffees;
  }

  findOne(id: string) {
    return this.coffees.find((item) => item.id === +id);
  }

  create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto);
  }

  update(id: string, updateCoffeeDto: any) {
    const existingCoffee = this.findOne(id);
    if (existingCoffee) {
      // update the existing entity
    }
  }

  remove(id: string) {
    const coffeeIndex = this.coffees.findIndex((item) => item.id === +id);
    if (coffeeIndex >= 0) {
      this.coffees.splice(coffeeIndex, 1);
    }
  }
}
