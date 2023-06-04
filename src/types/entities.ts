import { MealStatus } from '../types';

export interface DishEntity {
  id: string;
  type: string;
  userId: string;
  name: string;
  minimumInterval: number;
  last: Date | null;
  prepEffort: number;
  prepTime: number;
  cleanupEffort: number;
  suggestedAccompanimentTypeSpecs: SuggestedAccompanimentTypeForMainSpec[],
}

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

export interface SuggestedAccompanimentTypeForMainEntityInDb {
  mainDishId: string,
  suggestedAccompanimentTypeEntityId: string,
  count: number,
}

export interface SuggestedAccompanimentTypeForMainSpec {
  suggestedAccompanimentTypeEntityId: string,
  count: number,
}
