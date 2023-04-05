export interface MealWheelConfiguration {
  PORT: number;
  MONGO_URI: string;
}

export enum MealStatus {
  pending = 0,
  prepared = 1,
  skipped = 2,
}
