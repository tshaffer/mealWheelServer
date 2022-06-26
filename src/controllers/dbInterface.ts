import { Document } from 'mongoose';
import Dish from '../models/Dish';
import { DishEntity } from '../types';

export const createDishDocument = (dishEntity: DishEntity): Promise<any> => {
  return Dish.create(dishEntity)
    .then((dish: Document) => {
      return Promise.resolve(dish);
    });
};

