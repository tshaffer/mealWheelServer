import { DishType, RequiredAccompanimentFlags } from './entities';

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

