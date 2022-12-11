import express from 'express';
import cors from 'cors';
import connectDB from './config/db';

// import cookieParser from 'cookie-parser';
import { readConfig } from './config';

const bodyParser = require('body-parser');

import { Routes } from './routes/routes';

import {
  addScheduledMeal,
  getDefinedMeals,
  getDishes,
  getScheduledMeals,
  addDish,
  // addMeal,
  // getMeals,
  getUsers,
  getVersion,
  uploadMealWheelSpec,
  // updateDish,
  updateMeal,
  // validateDb,
  // uploadDishSpec,
  validate,
  deleteScheduledMeal,
  addIngredient,
  addIngredientToDish,
  deleteIngredientFromDish,
  replaceIngredientInDish,
  updateIngredient,
} from './controllers';
import { getIngredients, getIngredientsByDish } from './controllers/ingredients';

class App {

  public app: express.Application;
  public route: Routes = new Routes();

  constructor() {

    console.log('app.ts constructor invoked');

    console.log('readConfig');

    try {
      readConfig('/Users/tedshaffer/Documents/Projects/mealWheel/mealWheelServer/src/config/config.env');
    } catch (err: any) {
      console.log('readConfig error');
    }

    console.log('port environment variable: ', process.env.PORT);
    console.log('mongo environment variable: ', process.env.MONGO_URI);

    connectDB();

    this.app = express();
    this.config();

    this.app.use(express.static(__dirname + '/public'));
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.route.routes(this.app);

    // app routes
    this.app.get('/api/v1/version', getVersion);
    this.app.get('/api/v1/users', getUsers);
    this.app.post('/api/v1/mealWheelSpec', uploadMealWheelSpec);

    this.app.get('/api/v1/dishes', getDishes);
    this.app.get('/api/v1/ingredients', getIngredients);
    this.app.get('/api/v1/ingredientsByDish', getIngredientsByDish);
    this.app.post('/api/v1/addDish', addDish);
    this.app.post('/api/v1/addIngredient', addIngredient)
    this.app.post('/api/v1/updateIngredient', updateIngredient)
    this.app.post('/api/v1/addIngredientToDish', addIngredientToDish)
    this.app.post('/api/v1/replaceIngredientInDish', replaceIngredientInDish)
    this.app.post('/api/v1/deleteIngredientFromDish', deleteIngredientFromDish)

    this.app.get('/api/v1/definedMeals', getDefinedMeals);
    this.app.get('/api/v1/scheduledMeals', getScheduledMeals);
    this.app.post('/api/v1/addScheduledMeal', addScheduledMeal);
    this.app.post('/api/v1/updateMeal', updateMeal);
    this.app.post('/api/v1/deleteScheduledMeal', deleteScheduledMeal);

    this.app.get('/api/v1/validate', validate);
  }

  private config(): void {
    let port: any = process.env.PORT;
    if (port === undefined || port === null || port === '') {
      port = 8888;
    }
    this.app.set('port', port);
  }
}

export default new App().app;
