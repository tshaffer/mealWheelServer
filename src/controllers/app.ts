import { Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
const path = require('node:path');
import Papa from 'papaparse';

import {
  BaseDishEntity,
  DishType,
  IngredientEntity,
  IngredientInDishEntity,
  MainDishEntity,
  ScheduledMealEntity
} from '../types';

import {
  createBaseDishDocument,
  createMainDishDocument,
  createScheduledMealDocument,
  getAccompanimentDishesFromDb,
  getDishesFromDb,
  getMainDishesFromDb,
  getScheduledMealsFromDb,
  getSaladDishesFromDb,
  getSideDishesFromDb,
  getVegDishesFromDb,
  updateDishDb,
  updateMealDb,
  createIngredientDocument,
  getDefinedMealsFromDb,
  validateDb,
  deleteScheduledMealDb,
  createDishDocument,
  createIngredientInDishDocument,
  deleteIngredientFromDishDb,
  replaceIngredientInDishDb,
  updateIngredientDb
} from './dbInterface';

import { version } from '../version';
import {
  DefinedMealEntity,
  RequiredAccompanimentFlags
} from '../types';
import { isBoolean, isNil, isNumber, isString } from 'lodash';

export const getVersion = (request: Request, response: Response, next: any) => {
  console.log('getVersion');
  const data: any = {
    serverVersion: version,
  };
  response.json(data);
};

export const uploadMealWheelSpec = (request: Request, response: Response, next: any) => {

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public');
    },
    filename: function (req, file, cb) {
      cb(null, 'mealWheelSpec.csv');
    }
  });

  const upload = multer({ storage: storage }).single('file');

  upload(request, response, function (err) {
    if (err instanceof multer.MulterError) {
      return response.status(500).json(err);
    } else if (err) {
      return response.status(500).json(err);
    }
    console.log('return from upload: ', request.file);
    const userId: string = request.body.userId;
    console.log('userId: ', userId);
    const filePath: string = path.join('public', 'mealWheelSpec.csv');
    const content: string = fs.readFileSync(filePath).toString();

    const result = Papa.parse(content,
      {
        header: false,
        dynamicTyping: true,
        transform,
      });

    const errorList: string[] = processMealWheelSpec(userId, result.data as any[]);
    if (errorList.length > 0) {
     return response.status(400).json(errorList);
    }

    const responseData = {
      uploadStatus: 'success',
    };
    return response.status(200).send(responseData);
  });
};

const processMealWheelSpec = (userId: string, convertedMealWheelSpecItems: any[]): string[] => {

  const errorList: string[] = [];

  console.log('processMealWheelSpec: ', userId);
  console.log(userId);
  if (isString(userId)) {
    console.log('userId is string');
  } else if (isNumber(userId)) {
    console.log('userId is number');
  } else {
    console.log('userId is neither string nor number');
    errorList.push('Invalid user id - contact customer support');
    return errorList;
  }

  console.log('convertedMealWheelSpecItems');
  console.log(convertedMealWheelSpecItems);

  let currentEntityType = 'none';

  const dishesByName: { [id: string]: BaseDishEntity; } = {};  // id is dish name
  const ingredientsByName: { [id: string]: IngredientEntity; } = {}; // id is ingredient name
  const ingredientNamesInDishSpecByDishName: { [id: string]: string[]; } = {}; // id is dishName, value is list of ingredient names

  for (let i = 0; i < convertedMealWheelSpecItems.length; i++) {

    const parsedLine: any[] = convertedMealWheelSpecItems[i];

    if (isEmptyLine(parsedLine)) {
      continue;
    }

    const entityTypeValue = parsedLine[0];

    if (isString(entityTypeValue)) {
      switch (entityTypeValue) {
        case 'mains':
        case 'veggies':
        case 'salads':
        case 'sides':
        case 'ingredients':
        case 'ingredient in dish':
          currentEntityType = entityTypeValue;
          continue;
          break;
        default:
          if (entityTypeValue !== '') {
            errorList.push('Unrecognized value in first column: ' + entityTypeValue + '. Valid values are mains, veggies, salads, sides, ingredients, ingredient in dish');
            return errorList;
          }
          break;
      }
    }

    let ingredientName;

    switch (currentEntityType) {
      case 'mains':

        if (!isString(parsedLine[1])) {
          errorList.push('Invalid non string value for main name on line: ' + parsedLine);
          continue;
        }
        const mainName: string = parsedLine[1];
        if (dishesByName.hasOwnProperty(mainName)) {
          errorList.push('Duplicate main name on line: ' + parsedLine);
          continue;
        }

        const requiresVeggie: boolean = parsedLine[2];
        const requiresSide: boolean = parsedLine[3];
        const requiresSalad: boolean = parsedLine[4];
        if (!isBoolean(requiresVeggie) || !isBoolean(requiresSalad) || !isBoolean(requiresSide)) {
          errorList.push('Invalid accompaniment specification on line: ' + parsedLine);
          continue;
        }

        const mainDish: MainDishEntity = {
          id: uuidv4(),
          userId,
          name: mainName,
          type: DishType.Main,
          accompanimentRequired: RequiredAccompanimentFlags.None,
          ingredientIds: [],
        }
        if (requiresVeggie) {
          mainDish.accompanimentRequired = RequiredAccompanimentFlags.Veggie;
        }
        if (requiresSalad) {
          mainDish.accompanimentRequired += RequiredAccompanimentFlags.Salad;
        }
        if (requiresSide) {
          mainDish.accompanimentRequired += RequiredAccompanimentFlags.Side;
        }
        dishesByName[mainName] = mainDish;
        break;
      case 'veggies':
        const veggieName: string = parsedLine[1];
        const veggieDish: BaseDishEntity = {
          id: uuidv4(),
          userId,
          name: veggieName,
          type: DishType.Veggie,
          ingredientIds: [],
        }
        dishesByName[veggieName] = veggieDish;
        break;
      case 'salads':
        const saladName: string = parsedLine[1];
        const saladDish: BaseDishEntity = {
          id: uuidv4(),
          userId,
          name: saladName,
          type: DishType.Salad,
          ingredientIds: [],
        }
        dishesByName[saladName] = saladDish;
        break;
      case 'sides':
        const sideName: string = parsedLine[1];
        const sideDish: BaseDishEntity = {
          id: uuidv4(),
          userId,
          name: sideName,
          type: DishType.Side,
          ingredientIds: [],
        }
        dishesByName[sideName] = sideDish;
        break;
      case 'ingredients':
        ingredientName = parsedLine[1];
        const showInGroceryList = parsedLine[2];
        const ingredientEntity: IngredientEntity = {
          id: uuidv4(),
          name: ingredientName,
          showInGroceryList: showInGroceryList,
          ingredients: []
        };
        ingredientsByName[ingredientName] = ingredientEntity;
        createIngredientDocument(ingredientEntity);
        break;
      case 'ingredient in dish':
        const dishName = parsedLine[1];
        ingredientName = parsedLine[2];
        if (isNil(ingredientNamesInDishSpecByDishName[dishName])) {
          ingredientNamesInDishSpecByDishName[dishName] = [];
        }
        ingredientNamesInDishSpecByDishName[dishName].push(ingredientName);
        break;
      default:
        break;
    }
  }

  // create ingredientInDish documents
  for (const dishName in ingredientNamesInDishSpecByDishName) {
    if (Object.prototype.hasOwnProperty.call(ingredientNamesInDishSpecByDishName, dishName)) {
      const ingredientNamesInDishSpec: string[] = ingredientNamesInDishSpecByDishName[dishName];
      for (const ingredientInDishName of ingredientNamesInDishSpec) {
        if (dishesByName.hasOwnProperty(dishName)) {
          const dishId = dishesByName[dishName].id;
          const ingredientId: string = ingredientsByName[ingredientInDishName].id;
          const ingredientInDishEntity: IngredientInDishEntity = {
            dishId,
            ingredientId
          };
          createIngredientInDishDocument(ingredientInDishEntity);
        }
        else {
          console.log(dishName + ' not found in dishesByName');
        }
      }
    }
  }

  // return to dishes and fill in the ingredients
  for (const dishName in dishesByName) {
    if (Object.prototype.hasOwnProperty.call(dishesByName, dishName)) {
      const dish: BaseDishEntity = dishesByName[dishName];

      // given the dish, iterate through ingredientsInDishSpecsByDishName

      // are there any ingredients for this dish?
      if (!isNil(ingredientNamesInDishSpecByDishName[dishName])) {
        const ingredientNamesInDishSpec: string[] = ingredientNamesInDishSpecByDishName[dishName];
        for (const ingredientNameInDishSpec of ingredientNamesInDishSpec) {
          if (!isNil(ingredientsByName[ingredientNameInDishSpec])) {
            // retrieve IngredientInDishEntity
            const ingredientEntity: IngredientEntity = ingredientsByName[ingredientNameInDishSpec];
            dish.ingredientIds.push(ingredientEntity.id);
          }
        }
      }

      if (dish.type === DishType.Main) {
        createMainDishDocument(dish as MainDishEntity);
      } else {
        createBaseDishDocument(dish);
      }
    }
  }

  console.log('upload complete');

  return errorList;
}

const isEmptyLine = (lineOfInput: any[]): boolean => {
  const columnValues: any[] = Object.values(lineOfInput);
  for (const columnValue of columnValues) {
    if (!isBoolean(columnValue)) {
      return false;
    }
  }
  return true;
}

const transform = (arg1: any, arg2: any) => {
  if (arg1 === '') {
    return 'FALSE';
  } else {
    return arg1;
  }
}

// TEDTODO - scheduled meal entities or defined meal entities
export function getScheduledMeals(request: Request, response: Response) {

  const id: string = request.query.id as string;

  return getScheduledMealsFromDb(id)
    .then((scheduledMealEntities: ScheduledMealEntity[]) => {
      console.log('return from getScheduledMealsFromDb, invoke response.json');
      response.json(scheduledMealEntities);
    });
}

export function getDefinedMeals(request: Request, response: Response) {

  const id: string = request.query.id as string;

  return getDefinedMealsFromDb(id)
    .then((definedMealEntities: DefinedMealEntity[]) => {
      console.log('return from getDefinedMealsFromDb, invoke response.json');
      response.json(definedMealEntities);
    });
}

export function getDishes(request: Request, response: Response) {

  const id: string = request.query.id as string;

  return getDishesFromDb(id)
    .then((dishEntities: BaseDishEntity[]) => {
      console.log('return from getDishesFromDb, invoke response.json');
      response.json(dishEntities);
    });

}

export function getMainDishes(request: Request, response: Response) {

  const id: string = request.query.id as string;

  return getMainDishesFromDb(id)
    .then((dishEntities: BaseDishEntity[]) => {
      console.log('return from getDishesFromDb, invoke response.json');
      response.json(dishEntities);
    });

}

export function getAccompanimentDishes(request: Request, response: Response) {
  const id: string = request.query.id as string;

  return getAccompanimentDishesFromDb(id)
    .then((dishEntities: BaseDishEntity[]) => {
      console.log('return from getDishesFromDb, invoke response.json');
      response.json(dishEntities);
    });
}

export function getVegDishes(request: Request, response: Response) {
  const id: string = request.query.id as string;

  return getVegDishesFromDb(id)
    .then((dishEntities: BaseDishEntity[]) => {
      console.log('return from getDishesFromDb, invoke response.json');
      response.json(dishEntities);
    });
}

export function getSaladDishes(request: Request, response: Response) {
  const id: string = request.query.id as string;

  return getSaladDishesFromDb(id)
    .then((dishEntities: BaseDishEntity[]) => {
      console.log('return from getDishesFromDb, invoke response.json');
      response.json(dishEntities);
    });
}

export function getSideDishes(request: Request, response: Response) {
  const id: string = request.query.id as string;

  return getSideDishesFromDb(id)
    .then((dishEntities: BaseDishEntity[]) => {
      console.log('return from getDishesFromDb, invoke response.json');
      response.json(dishEntities);
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
  const { id, userId, mainDishId, saladId, veggieId, sideId, dateScheduled, status } = meal;

  updateMealDb(id, userId, mainDishId, saladId, veggieId, sideId, dateScheduled, status);

  response.sendStatus(200);

}

export const deleteScheduledMeal = (request: Request, response: Response, next: any) => {

  const { id } = request.body;
  deleteScheduledMealDb(id);
  response.sendStatus(200);

}

export const addDish = (request: Request, response: Response, next: any) => {

  console.log('addDish');
  console.log(request.body);

  const { dish, userId } = request.body;

  dish.userId = userId;
  createDishDocument(dish);

  response.sendStatus(200);
}

export const updateDish = (request: Request, response: Response, next: any) => {

  console.log('updateDish');
  // console.log(request.body);

  const { dish } = request.body;

  const { id, name, type, accompanimentRequired } = dish;
  updateDishDb(id, name, type, accompanimentRequired);

  response.sendStatus(200);

}

export const validate = (request: Request, response: Response, next: any) => {
  validateDb();
  response.sendStatus(200);
}

export const addIngredient = (request: Request, response: Response, next: any) => {

  console.log('addIngredient');
  console.log(request.body);

  const { id, name, ingredients, showInGroceryList } = request.body;

  const ingredientEntity: IngredientEntity = {
    id,
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
  const { id, name, ingredients, showInGroceryList } = request.body;

  const ingredientEntity: IngredientEntity = {
    id,
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