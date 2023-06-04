import { Request, Response } from 'express';

import {
  AccompanimentTypeEntity,
  DishEntity,
  IngredientEntity,
  IngredientInDishEntity,
  ScheduledMealEntity,
  SuggestedAccompanimentTypeForMainEntityInDb,
  SuggestedAccompanimentTypeForMainSpec
} from '../types';

import {
  createDishDocument,
  createScheduledMealDocument,
  getDishesFromDb,
  getScheduledMealsFromDb,
  updateDishDb,
  updateMealDb,
  createIngredientDocument,
  deleteScheduledMealDb,
  createIngredientInDishDocument,
  deleteIngredientFromDishDb,
  replaceIngredientInDishDb,
  updateIngredientDb,
  getAccompanimentTypesFromDb,
  getSuggestedAccompanimentTypesForMains,
  createSuggestedAccompanimentTypeForMain,
  createSuggestedAccompanimentTypesForMain,
  deleteDishFromDb,
  // validateDb,
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
  const userId: string = request.query.id as string;

  console.log('getDishes');
  console.log(userId);

  const mainDishEntitiesPromise: Promise<DishEntity[]> = getDishesFromDb(userId);
  const suggestedAccompanimentTypeForMainEntityInDbPromise: Promise<SuggestedAccompanimentTypeForMainEntityInDb[]> = getSuggestedAccompanimentTypesForMains();

  return Promise.all([mainDishEntitiesPromise, suggestedAccompanimentTypeForMainEntityInDbPromise])
    .then((values) => {
      const rawDishEntities: DishEntity[] = values[0];
      const suggestedAccompanimentTypesForMainsFromDb: SuggestedAccompanimentTypeForMainEntityInDb[] = values[1];

      const mainDishEntities: DishEntity[] = [];

      rawDishEntities.forEach((rawDishEntity: DishEntity) => {

        const suggestedAccompanimentTypeSpecs: SuggestedAccompanimentTypeForMainSpec[] = [];

        const mainDishId = rawDishEntity.id;
        suggestedAccompanimentTypesForMainsFromDb.forEach((suggestedAccompanimentTypeForMainsFromDb: SuggestedAccompanimentTypeForMainEntityInDb) => {
          if (suggestedAccompanimentTypeForMainsFromDb.mainDishId === mainDishId) {
            const suggestedAccompanimentTypeForMainSpec: SuggestedAccompanimentTypeForMainSpec = {
              suggestedAccompanimentTypeEntityId: suggestedAccompanimentTypeForMainsFromDb.suggestedAccompanimentTypeEntityId,
              count: suggestedAccompanimentTypeForMainsFromDb.count,
            };
            suggestedAccompanimentTypeSpecs.push(suggestedAccompanimentTypeForMainSpec);
          }
        });

        const { type, id, userId, name, minimumInterval, last, prepEffort, prepTime, cleanupEffort } = rawDishEntity;
        const mainDishEntity: DishEntity = {
          type,
          id,
          userId,
          name,
          minimumInterval,
          last,
          prepEffort,
          prepTime,
          cleanupEffort,
          suggestedAccompanimentTypeSpecs,
        };
        mainDishEntities.push(mainDishEntity);
      })
      response.json(mainDishEntities);
    });
}

export const getSuggestedAccompanimentTypesForMain = (request: Request, response: Response) => {

  console.log('getSuggestedAccompanimentTypesForMain');

  return getSuggestedAccompanimentTypesForMains()
    .then((suggestedAccompanimentTypeForMainEntities: SuggestedAccompanimentTypeForMainEntityInDb[]) => {
      console.log('promise resolved in getSuggestedAccompanimentTypesForMain');
      response.json(suggestedAccompanimentTypeForMainEntities);
    });
}

export const addAccompaniment = (request: Request, response: Response, next: any) => {

  console.log('addAccompaniment');
  console.log(request.body);

  const { dish, userId } = request.body;

  dish.userId = userId;
  createDishDocument(dish);

  response.sendStatus(200);
}

export const addMain = (request: Request, response: Response, next: any) => {

  console.log('addMain');
  console.log(request.body);

  const { dish, userId } = request.body;

  dish.userId = userId;
  createDishDocument(dish)
    .then((dishDocument: any) => {
      createSuggestedAccompanimentTypesForMain(dish.id, (dish as DishEntity).suggestedAccompanimentTypeSpecs);
      response.sendStatus(200);
    });

}

export const updateDish = (request: Request, response: Response, next: any) => {

  console.log('updateDish');
  console.log(request.body);
  console.log(request.body.dish);

  const { dish } = request.body;

  const { id, name, type, minimumInterval, last, suggestedAccompanimentTypeSpecs, prepEffort, prepTime, cleanupEffort } = dish;
  updateDishDb(id, name, type, minimumInterval, last, suggestedAccompanimentTypeSpecs, prepEffort, prepTime, cleanupEffort);

  response.sendStatus(200);

}

export const deleteDish = (request: Request, response: Response, next: any) => {

  console.log('deleteDish');
  console.log(request.body);

  const { dishId } = request.body;

  deleteDishFromDb(dishId);

  response.sendStatus(200);
}

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

export const addIngredientToDish = (request: Request, response: Response, next: any) => {

  console.log('addIngredientToDish');
  console.log(request.body);

  const { dishId, ingredientId } = request.body;

  const ingredientInDishEntity: IngredientInDishEntity = {
    dishId,
    ingredientId
  };
  createIngredientInDishDocument(ingredientInDishEntity);

  response.sendStatus(200);
}

export const replaceIngredientInDish = (request: Request, response: Response, next: any) => {

  console.log('replaceIngredientInDish');
  console.log(request.body);

  const { dishId, existingIngredientId, newIngredientId } = request.body;

  replaceIngredientInDishDb(dishId, existingIngredientId, newIngredientId);

  response.sendStatus(200);
}

export const deleteIngredientFromDish = (request: Request, response: Response, next: any) => {

  console.log('deleteIngredientFromDish');
  console.log(request.body);

  const { dishId, ingredientId } = request.body;

  deleteIngredientFromDishDb(dishId, ingredientId);

  response.sendStatus(200);
}

export const getAccompanimentTypes = (request: Request, response: Response) => {

  const userId: string = request.query.id as string;

  console.log('getAccompanimentTypes');
  console.log(userId);

  return getAccompanimentTypesFromDb(userId)
    .then((accompanimentTypes: AccompanimentTypeEntity[]) => {
      response.json(accompanimentTypes);
    });
}

export const addSuggestedAccompanimentTypeForMain = (request: Request, response: Response, next: any) => {

  console.log('addSuggestedAccompanimentTypeForMain');
  // console.log(request);
  console.log(Object.keys(request));
  console.log(request.body);

  const { mainDishId, suggestedAccompanimentTypeEntityId, count } = request.body;
  const suggestedAccompanimentTypeForMainEntity: SuggestedAccompanimentTypeForMainEntityInDb = {
    mainDishId, suggestedAccompanimentTypeEntityId, count
  };
  createSuggestedAccompanimentTypeForMain(suggestedAccompanimentTypeForMainEntity);

  response.sendStatus(200);
}

