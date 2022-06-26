export interface MealWheelConfiguration {
  PORT: number;
  MONGO_URI: string;
}

export interface ConvertedCSVDish {
  name: string;
  type: string;
  side: boolean;
  salad: boolean;
  veg: boolean;
}