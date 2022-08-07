import express from 'express';
import cors from 'cors';
import connectDB from './config/db';

// import cookieParser from 'cookie-parser';
import { readConfig } from './config';

const bodyParser = require('body-parser');

import { Routes } from './routes/routes';

import {
  addDish,
  addMeal,
  getDishes,
  getUsers,
  getVersion,
  updateDish,
  uploadDishSpec,
} from './controllers';

class App {

  public app: express.Application;
  public route: Routes = new Routes();

  constructor() {

    readConfig('/Users/tedshaffer/Documents/Projects/mealWheel/mealWheelServer/src/config/config.env');

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
    this.app.get('/api/v1/dishes', getDishes);
    this.app.post('/api/v1/dishSpec', uploadDishSpec);
    this.app.post('/api/v1/addDish', addDish);
    this.app.post('/api/v1/updateDish', updateDish);
    this.app.post('/api/v1/addMeal', addMeal);
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
