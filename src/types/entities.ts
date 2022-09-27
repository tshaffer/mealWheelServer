import { DishType, MealStatus, RequiredAccompanimentFlags } from '../types';

export interface BaseDishEntity {
  id: string;
  userId: string;
  name: string;
  type: DishType;
  interval: number;
  last: Date | null;
}

export interface MainDishEntity extends BaseDishEntity {
  accompanimentRequired: RequiredAccompanimentFlags;
}

export interface DefinedMealEntity {
  id: string;
  userId: string;
  name: string;
  mainDishId: string;
  saladId: string;
  veggieId: string;
  sideId: string;
  mainName: string;
  veggieName: string;
  saladName: string;
  sideName: string;
  interval: number;
  last: Date | null;
}

export interface ScheduledMealEntity {
  id: string;
  userId: string;
  mainDishId: string;
  saladId: string;
  veggieId: string;
  sideId: string;
  dateScheduled: Date;
  status: MealStatus;
}

export interface UserEntity {
  id: string;
  userName: string;
  password: string;
  email: string;
}

