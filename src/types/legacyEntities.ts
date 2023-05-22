import { DishType, IDish } from './entities';

export enum RequiredAccompanimentFlags {
  None = 0,
  Side = 1,
  Salad = 2,
  Veggie = 4,
}


export interface OldDishEntity {
  id: string;
  userId: string;
  name: string;
  type: DishType;
  minimumInterval: number;
  last: Date | null;
  accompanimentRequired?: RequiredAccompanimentFlags;   // only applies when dishType === DishType.Main
  ingredientIds: string[];
  prepEffort: number;
  prepTime: number;
  cleanupEffort: number;
}

export interface OldBaseDishEntity {
  id: string;
  userId: string;
  name: string;
  type: DishType;
  minimumInterval: number;
  last: Date | null;
  ingredientIds: string[];
  prepEffort: number;
  prepTime: number;
  cleanupEffort: number;

}

export interface OldMainDishEntity extends OldBaseDishEntity {
  accompanimentRequired: RequiredAccompanimentFlags;
}

interface IMainDishGen2 extends IDish {
  numAccompanimentsRequired: number,
  allowableAccompanimentTypeEntityIds: string[],
}

export type MainDishEntityGen2 = IMainDishGen2;
