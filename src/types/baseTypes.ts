export interface MealWheelConfiguration {
  PORT: number;
  MONGO_URI: string;
}

export enum DishType {
  Main = 'main',
  Side = 'side',
  Salad = 'salad',
  Veg = 'veg',
}

export enum RequiredAccompanimentFlags {
  None = 0,
  Side = 1,
  Salad = 2,
  Veg = 4,
}

export interface ConvertedCSVDish {
  name: string;
  type: string;
  side: boolean;
  salad: boolean;
  veg: boolean;
}

export enum MealStatus {
  pending = 0,
  accepted = 1,
  completed = 2,
}
