export interface MealWheelConfiguration {
  PORT: number;
  MONGO_URI: string;
}

export interface ConvertedDishes {
  data: ConvertedCSVDish[];
}

export interface ConvertedCSVDish {
  name: string;
  type: string;
  side: boolean;
  salad: boolean;
  veg: boolean;
}