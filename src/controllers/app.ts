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
  MealWheelEntityType,
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
  createDefinedMealDocument,
  createIngredientDocument,
  getDefinedMealsFromDb,
  validateDb,
  deleteScheduledMealDb,
  createDishDocument,
  createIngredientInDishDocument
} from './dbInterface';

import { version } from '../version';
import {
  // ConvertedCSVDish,
  // DishEntity,
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
        header: true,
        dynamicTyping: true,
        transform,
      });

    processMealWheelSpec(userId, result.data as any[]);

    const responseData = {
      uploadStatus: 'success',
    };
    return response.status(200).send(responseData);
  });
};

const processMealWheelSpec = (userId: string, convertedMealWheelSpecItems: any[]) => {

  console.log('processMealWheelSpec: ', userId);
  console.log(userId);
  if (isString(userId)) {
    console.log('userId is string');
  } else if (isNumber(userId)) {
    console.log('userId is number');
  } else {
    console.log('userId is neither string nor number');
  }

  console.log('convertedMealWheelSpecItems');
  console.log(convertedMealWheelSpecItems);

  const mealEntities: DefinedMealEntity[] = [];
  const dishesByName: { [id: string]: BaseDishEntity; } = {};  // id is dish name
  const ingredientsByName: { [id: string]: IngredientEntity; } = {}; // id is ingredient name
  const ingredientNamesInDishSpecByDishName: { [id: string]: string[]; } = {}; // id is dishName, value is list of ingredient names

  for (let i = 0; i < convertedMealWheelSpecItems.length; i++) {

    const propsAsArray: any[] = Object.values(convertedMealWheelSpecItems[i]);

    const [
      enteredEntityType,
      enteredDishType,
      enteredMealName,
      enteredMainName,
      enteredRequiresVeggie,
      enteredRequiresSalad,
      enteredRequiresSide,
      enteredVeggieName,
      enteredSaladName,
      enteredSideName,
      enteredIngredientName,
      enteredShowInGroceryList,
    ] = propsAsArray;

    if (isNil(enteredEntityType) || isBoolean(enteredEntityType)) {
      continue;
    }

    let entityType: MealWheelEntityType = MealWheelEntityType.Dish;
    switch (enteredEntityType) {
      case 'meal':
        entityType = MealWheelEntityType.Meal
        break;
      case 'dish':
      default:
        entityType = MealWheelEntityType.Dish;
        break;
      case 'ingredient':
        entityType = MealWheelEntityType.Ingredient;
        break;
      case 'ingredientInDish':
        entityType = MealWheelEntityType.IngredientInDish;
        break;
    }

    let dishType: DishType = DishType.Main;
    if (entityType === MealWheelEntityType.Dish) {
      switch (enteredDishType) {
        case 'veggie':
          dishType = DishType.Veggie;
          break;
        case 'salad':
          dishType = DishType.Salad;
          break;
        case 'side':
          dishType = DishType.Side;
          break;
        // case 'main':
        //   default:
      }
    }

    let mainName: string = isString(enteredMainName) ? enteredMainName : '';
    const veggieName: string = isString(enteredVeggieName) ? enteredVeggieName : '';
    const saladName: string = isString(enteredSaladName) ? enteredSaladName : '';
    const sideName: string = isString(enteredSideName) ? enteredSideName : '';
    const requiresVeggie: boolean = enteredRequiresVeggie as boolean;
    const requiresSalad: boolean = enteredRequiresSalad as boolean;
    const requiresSide: boolean = enteredRequiresSide as boolean;
    const ingredientName: string = isString(enteredIngredientName) ? enteredIngredientName : '';
    const showInGroceryList: boolean = enteredShowInGroceryList as boolean;

    if (entityType === MealWheelEntityType.Meal) {
      const mealEntity: DefinedMealEntity = {
        id: uuidv4(),
        userId,
        name: enteredMealName,
        mainDishId: '',               // fill in the following after parsing dishes
        saladId: '',
        veggieId: '',
        sideId: '',
        mainName,
        veggieName,
        saladName,
        sideName,
      }
      mealEntities.push(mealEntity);
    } else if (entityType === MealWheelEntityType.Dish) {
      if (dishType === DishType.Main) {
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
      } else {
        let dishName = '';
        switch (dishType) {
          case DishType.Veggie:
            dishName = veggieName;
            break;
          case DishType.Salad:
            dishName = saladName;
            break;
          case DishType.Side:
            dishName = sideName;
            break;
          default:
            debugger;
        }
        const baseDish: BaseDishEntity = {
          id: uuidv4(),
          userId,
          name: dishName,
          type: dishType,
          ingredientIds: [],
        }
        dishesByName[dishName] = baseDish;
      }
    } else if (entityType === MealWheelEntityType.Ingredient) {
      const ingredientEntity: IngredientEntity = {
        id: uuidv4(),
        name: ingredientName,
        showInGroceryList,
        ingredients: []
      };
      ingredientsByName[ingredientName] = ingredientEntity;
      createIngredientDocument(ingredientEntity);
    } else if (entityType === MealWheelEntityType.IngredientInDish) {
      const dishName = enteredDishType;
      const ingredientName = enteredMealName;
      if (isNil(ingredientNamesInDishSpecByDishName[dishName])) {
        ingredientNamesInDishSpecByDishName[dishName] = [];
      }
      ingredientNamesInDishSpecByDishName[dishName].push(ingredientName);
    }
  }

  // return to meals and fill in the accompaniment id's
  for (const mealEntity of mealEntities) {
    mealEntity.mainDishId = dishesByName[mealEntity.mainName].id;
    if (mealEntity.veggieName !== '') {
      mealEntity.veggieId = dishesByName[mealEntity.veggieName].id;
    }
    if (mealEntity.saladName !== '') {
      mealEntity.saladId = dishesByName[mealEntity.saladName].id;
    }
    if (mealEntity.sideName !== '') {
      mealEntity.sideId = dishesByName[mealEntity.sideName].id;
    }
    createDefinedMealDocument(mealEntity);
  }

  // create ingredientInDish documents
  for (const dishName in ingredientNamesInDishSpecByDishName) {
    if (Object.prototype.hasOwnProperty.call(ingredientNamesInDishSpecByDishName, dishName)) {
      const ingredientNamesInDishSpec: string[] = ingredientNamesInDishSpecByDishName[dishName];
      for (const ingredientInDishName of ingredientNamesInDishSpec) {
        const dishId = dishesByName[dishName].id;
        const ingredientId: string = ingredientsByName[ingredientInDishName].id;
        const ingredientInDishEntity: IngredientInDishEntity = {
          dishId,
          ingredientId
        };
        createIngredientInDishDocument(ingredientInDishEntity);
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
  const { id, userId, name, type, accompaniment } = dish;

  updateDishDb(id, userId, name, type, accompaniment);

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

