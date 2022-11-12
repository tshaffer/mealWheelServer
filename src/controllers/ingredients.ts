import { Request, Response } from 'express';

import {
  getIngredientsByDishFromDb
} from './dbInterface';

export function getIngredientsByDish(request: Request, response: Response) {

  const userId: string = request.query.id as string;

  return getIngredientsByDishFromDb(userId)
    .then((values: any[]) => {
      console.log('return from getIngredientsByDishFromDb, invoke response.json');
      response.json(values);
    });

}

