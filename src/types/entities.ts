import { DishType, MealStatus, RequiredAccompanimentFlags, UnitQuantityType } from '../types';

export interface DishEntity {
  id: string;
  userId: string;
  name: string;
  type: DishType;
  accompanimentRequired?: RequiredAccompanimentFlags;   // only applies when dishType === DishType.Main
  ingredients: IngredientInRecipe[];
}

export interface BaseDishEntity {
  id: string;
  userId: string;
  name: string;
  type: DishType;
  ingredients: IngredientInRecipe[];
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

export interface IngredientEntity {
  id: string;
  name: string;
  ingredients: IngredientEntity[];
}

export interface IngredientInRecipe {
  ingredientId: string;
  quantity: number;
  unitType: UnitQuantityType;
}