import { DishType, MealStatus, RequiredAccompanimentFlags } from '../types';

export interface BaseDishEntity {
  id: string;
  userId: string;
  name: string;
  type: DishType;
}

export interface MainDishEntity extends BaseDishEntity {
  accompaniment?: RequiredAccompanimentFlags;
}

export interface MealEntity {
  id: string;
  userId: string;
  mealId: string;
  mainDishId: string;
  accompanimentDishIds: string[];
  dateScheduled: Date;  // https://mongoosejs.com/docs/schematypes.html#dates
  status: MealStatus;
}

export interface UserEntity {
  id: string;
  userName: string;
  password: string;
  email: string;
}

