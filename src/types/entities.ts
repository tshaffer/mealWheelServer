import { DishType, MealStatus, RequiredAccompanimentFlags } from '../types';

export interface BaseDishEntity {
  id: string;
  userId: string;
  name: string;
  type: DishType;
}

export interface MainDishEntity extends BaseDishEntity {
  accompanimentRequired: RequiredAccompanimentFlags;
}

// predefined meal
export interface MealEntity {
  id: string;
  userId: string;
  mainDishId: string;
  accompanimentDishIds: string[];
  // determine the best way to do the following
  mainName: string;
  vegName: string;
  saladName: string;
  sideName: string;
  // dateScheduled: Date;  // https://mongoosejs.com/docs/schematypes.html#dates
  // status: MealStatus;
}

export interface UserEntity {
  id: string;
  userName: string;
  password: string;
  email: string;
}

