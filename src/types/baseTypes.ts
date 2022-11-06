export interface MealWheelConfiguration {
  PORT: number;
  MONGO_URI: string;
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

// export interface ConvertMealWheelSpecItem {

// }
// export interface ConvertedCSVDish {
//   name: string;
//   type: string;
//   side: boolean;
//   salad: boolean;
//   veg: boolean;
// }

export enum MealStatus {
  pending = 0,
  prepared = 1,
  skipped = 2,
}
