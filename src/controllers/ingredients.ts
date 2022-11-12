import { Request, Response } from 'express';

import {
  getIngredientsByDishFromDb, getIngredientsFromDb
} from './dbInterface';

export function getIngredients(request: Request, response: Response) {
  return getIngredientsFromDb()
    .then((values: any[]) => {
      console.log('return from getIngredients, invoke response.json');
      response.json(values);
    });
}


export function getIngredientsByDish(request: Request, response: Response) {

  const userId: string = request.query.id as string;

  return getIngredientsByDishFromDb(userId)
    .then((values: any[]) => {
      console.log('return from getIngredientsByDishFromDb, invoke response.json');
      response.json(values);
    });

}

