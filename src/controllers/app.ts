import { Request, Response } from 'express';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
const path = require('node:path');

import {
  AccompanimentDishEntity,
  AccompanimentTypeEntity,
  DishEntity,
  IngredientEntity,
  IngredientInDishEntity,
  MainDishEntity,
  ScheduledMealEntity
} from '../types';

import {
  // createBaseDishDocument,
  createMainDocument,
  createScheduledMealDocument,
  // getAccompanimentDishesFromDb,
  getDishesFromDb,
  getMainDishesFromDb,
  getScheduledMealsFromDb,
  updateDishDb,
  updateMealDb,
  createIngredientDocument,
  // getDefinedMealsFromDb,
  // validateDb,
  deleteScheduledMealDb,
  // createDishDocument,
  createIngredientInDishDocument,
  deleteIngredientFromDishDb,
  replaceIngredientInDishDb,
  updateIngredientDb,
  createAccompanimentDocument as createAccompanimentDocument,
  getAllAccompanimentsFromDb,
  getAccompanimentsFromDb,
  getAccompanimentTypesFromDb,
  upgradeDbSchema,
  // deleteDishFromDb
} from './dbInterface';

import { version } from '../version';

export const getVersion = (request: Request, response: Response, next: any) => {
  console.log('getVersion');
  const data: any = {
    serverVersion: version,
  };
  response.json(data);
};

export function getScheduledMeals(request: Request, response: Response) {

  const id: string = request.query.id as string;

  return getScheduledMealsFromDb(id)
    .then((scheduledMealEntities: ScheduledMealEntity[]) => {
      console.log('return from getScheduledMealsFromDb, invoke response.json');
      response.json(scheduledMealEntities);
    });
}

export function getMainDishes(request: Request, response: Response) {

  const id: string = request.query.id as string;

  return getMainDishesFromDb(id)
    .then((dishEntities: MainDishEntity[]) => {
      response.json(dishEntities);
    });

}

// export function getAccompanimentDishes(request: Request, response: Response) {
//   const id: string = request.query.id as string;

//   return getAccompanimentDishesFromDb(id)
//     .then((dishEntities: AccompanimentDishEntity[]) => {
//       response.json(dishEntities);
//     });
// }

export const addScheduledMeal = (request: Request, response: Response, next: any) => {

  console.log('addMeal');
  // console.log(request.body);

  const { scheduledMeal } = request.body;
  createScheduledMealDocument(scheduledMeal);

  response.sendStatus(200);
}

export const updateMeal = (request: Request, response: Response, next: any) => {

  console.log('updateMeal');
  // console.log(request.body);

  const { meal } = request.body;
  const { id, userId, mainDishId, accompanimentDishIds, dateScheduled, status } = meal;

  updateMealDb(id, userId, mainDishId, accompanimentDishIds, dateScheduled, status);

  response.sendStatus(200);

}

export const deleteScheduledMeal = (request: Request, response: Response, next: any) => {
  const { id } = request.body;
  deleteScheduledMealDb(id);
  response.sendStatus(200);
}

export const getDishes = (request: Request, response: Response) => {
  const id: string = request.query.id as string;

  console.log('getDishes');
  console.log(id);

  return getDishesFromDb(id)
    .then((dishEntities: DishEntity[]) => {
      response.json(dishEntities);
    });
}

export const getMains = (request: Request, response: Response) => {
  const id: string = request.query.id as string;

  console.log('getMains');
  console.log(id);

  return getMainDishesFromDb(id)
    .then((dishEntities: AccompanimentDishEntity[]) => {
      response.json(dishEntities);
    });
}

export const getAccompaniments = (request: Request, response: Response) => {
  const id: string = request.query.id as string;
  const accompanimentType: string = request.query.type as string;

  console.log('getAccompaniments');
  console.log(id);
  console.log('accompanimentType');
  console.log(accompanimentType);

  return getAccompanimentsFromDb(id, accompanimentType)
    .then((dishEntities: AccompanimentDishEntity[]) => {
      response.json(dishEntities);
    });
}

export const getAllAccompaniments = (request: Request, response: Response) => {
  const id: string = request.query.id as string;

  console.log('getAllAccompaniments');
  console.log(id);

  return getAllAccompanimentsFromDb(id)
    .then((dishEntities: AccompanimentDishEntity[]) => {
      response.json(dishEntities);
    });
}

export const addAccompaniment = (request: Request, response: Response, next: any) => {

  console.log('addAccompaniment');
  console.log(request.body);

  const { dish, userId } = request.body;

  dish.userId = userId;
  createAccompanimentDocument(dish);

  response.sendStatus(200);
}

export const addMain = (request: Request, response: Response, next: any) => {

  console.log('addMain');
  console.log(request.body);

  const { dish, userId } = request.body;

  dish.userId = userId;
  createMainDocument(dish);

  response.sendStatus(200);
}

export const updateDish = (request: Request, response: Response, next: any) => {

  console.log('updateDish');
  console.log(request.body);
  console.log(request.body.dish);

  const { dish } = request.body;

  const { id, name, type, minimumInterval, last, numAccompanimentsRequired, allowableAccompanimentTypeEntityIds, prepEffort, prepTime, cleanupEffort } = dish;
  updateDishDb(id, name, type, minimumInterval, last, numAccompanimentsRequired, allowableAccompanimentTypeEntityIds, prepEffort, prepTime, cleanupEffort);

  response.sendStatus(200);

}

// export const deleteDish = (request: Request, response: Response, next: any) => {

//   console.log('deleteDish');
//   console.log(request.body);

//   const { dishId } = request.body;

//   deleteDishFromDb(dishId);

//   response.sendStatus(200);
// }

// export const validate = (request: Request, response: Response, next: any) => {
//   validateDb();
//   response.sendStatus(200);
// }

export const addIngredient = (request: Request, response: Response, next: any) => {

  console.log('addIngredient');
  console.log(request.body);

  const { id, userId, name, ingredients, showInGroceryList } = request.body;

  const ingredientEntity: IngredientEntity = {
    id,
    userId,
    name,
    ingredients,
    showInGroceryList,
  };
  createIngredientDocument(ingredientEntity);

  response.sendStatus(200);
}

export const updateIngredient = (request: Request, response: Response, next: any) => {

  console.log('updateIngredient');
  console.log(request.body);

  // TEDTODO - looks like there may be some unnecessary conversions going on in this path
  const { id, userId, name, ingredients, showInGroceryList } = request.body;

  const ingredientEntity: IngredientEntity = {
    id,
    userId,
    name,
    ingredients,
    showInGroceryList,
  };
  updateIngredientDb(ingredientEntity);

  response.sendStatus(200);
}

// export const addIngredientToDish = (request: Request, response: Response, next: any) => {

//   console.log('addIngredientToDish');
//   console.log(request.body);

//   const { dishId, ingredientId } = request.body;

//   const ingredientInDishEntity: IngredientInDishEntity = {
//     dishId,
//     ingredientId
//   };
//   createIngredientInDishDocument(ingredientInDishEntity);

//   response.sendStatus(200);
// }

// export const replaceIngredientInDish = (request: Request, response: Response, next: any) => {

//   console.log('replaceIngredientInDish');
//   console.log(request.body);

//   const { dishId, existingIngredientId, newIngredientId } = request.body;

//   replaceIngredientInDishDb(dishId, existingIngredientId, newIngredientId);

//   response.sendStatus(200);
// }

// export const deleteIngredientFromDish = (request: Request, response: Response, next: any) => {

//   console.log('deleteIngredientFromDish');
//   console.log(request.body);

//   const { dishId, ingredientId } = request.body;

//   deleteIngredientFromDishDb(dishId, ingredientId);

//   response.sendStatus(200);
// }

export const getAccompanimentTypes = (request: Request, response: Response) => {

  const userId: string = request.query.id as string;

  console.log('getAccompanimentTypes');
  console.log(userId);

  return getAccompanimentTypesFromDb(userId)
    .then((accompanimentTypes: AccompanimentTypeEntity[]) => {
      response.json(accompanimentTypes);
    });
}

export const upgradeSchema = (request: Request, response: Response, next: any) => {
  upgradeDbSchema();
  response.sendStatus(200);
}

