import { MealStatus } from '../types';

interface IDish {
  type: string;
  id: string;
  userId: string;
  name: string;
  minimumInterval: number;
  last: Date | null;
  ingredientIds: string[];
  prepEffort: number;
  prepTime: number;
  cleanupEffort: number;
}

interface IMainDish extends IDish {
  numAccompanimentsRequired: number,
  allowableAccompanimentTypeEntityIds: string[],
}

export enum MealWheelEntityType {
  Meal = 'meal',
  Dish = 'dish',
  Ingredient = 'ingredient',
  IngredientInDish= 'ingredientInDish',
};

export enum DishType {
  Main = 'main',
  Side = 'side',
  Salad = 'salad',
  Veggie = 'veggie',
}

export enum RequiredAccompanimentFlags {
  None = 0,
  Side = 1,
  Salad = 2,
  Veggie = 4,
}

export type DishEntity = IDish;
export type AccompanimentDishEntity = IDish;
export type MainDishEntity = IMainDish;


export interface AccompanimentTypeEntity {
  id: string;
  userId: string;
  name: string;
  uiIndex: number;
}

export interface ScheduledMealEntity {
  id: string;
  userId: string;
  mainDishId: string;
  accompanimentDishIds: string[];
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
  userId: string;
  name: string;
  showInGroceryList: boolean;
  ingredients: IngredientEntity[];
}

export interface IngredientInDishEntity {
  dishId: string;
  ingredientId: string;
}