import { DishType, MealStatus, RequiredAccompanimentFlags } from '../types';

export interface DishEntity {
  id: string;
  userId: string;
  name: string;
  type: DishType;
  accompaniment?: RequiredAccompanimentFlags;
}

export interface UserEntity {
  id: string;
  userName: string;
  password: string;
  email: string;
}

export interface MealEntity {
  id: string;
  userId: string;
  mealId: string;
  mainDishId: string;
  accompanimentDishId: string | null;
  dateScheduled: Date;  // https://mongoosejs.com/docs/schematypes.html#dates
  status: MealStatus;
}

