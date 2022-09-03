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

export interface MealEntity {
  id: string;
  userId: string;
  name: string;
  mainDishId: string;
  mainName: string;
  accompanimentDishIds: string[];
  veggieName: string;
  saladName: string;
  sideName: string;
}

export interface UserEntity {
  id: string;
  userName: string;
  password: string;
  email: string;
}

