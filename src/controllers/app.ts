import { Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
const path = require('node:path');
import Papa from 'papaparse';

import {
  BaseDishEntity,
  DishType,
  MainDishEntity,
  MealWheelEntityType
} from '../types';

import {
  createBaseDishDocument,
  createMainDishDocument,
  createMealDocument,
  // getDishesFromDb,
  getMealsFromDb,
  updateDishDb,
  updateMealDb
} from './dbInterface';

import { version } from '../version';
import {
  ConvertedCSVDish,
  // DishEntity,
  MealEntity,
  RequiredAccompanimentFlags
} from '../types';
import { isString } from 'lodash';
// import {
//   createDishDocument
// } from './dbInterface';

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

    const filePath = path.join('public', 'mealWheelSpec.csv');
    const content: string = fs.readFileSync(filePath).toString();
    console.log(content);

    const result = Papa.parse(content,
      {
        header: true,
        dynamicTyping: true,
        transform,
      });
    console.log(result);
    //processMealWheelSpec(result.data as ConvertedCSVDish[]);
    processMealWheelSpec(result.data as any[]);

    const responseData = {
      uploadStatus: 'success',
    };
    return response.status(200).send(responseData);
  });
};

const processMealWheelSpec = (convertedMealWheelSpecItems: any[]) => {

  const mealEntities: MealEntity[] = [];
  let dishesByName: { [id: string]: BaseDishEntity; } = {};  // id is dish name

  for (let i = 0; i < convertedMealWheelSpecItems.length; i++) {

    const convertedMealWheelSpecItemProperties = Object.values(convertedMealWheelSpecItems[i]);
    console.log(convertedMealWheelSpecItemProperties);

    const entityType: MealWheelEntityType = convertedMealWheelSpecItemProperties[0] === 'meal' ? MealWheelEntityType.Meal : MealWheelEntityType.Dish;

    let dishType: DishType = DishType.Main;
    if (entityType === MealWheelEntityType.Dish) {
      switch (convertedMealWheelSpecItemProperties[1]) {
        case 'veg':
          dishType = DishType.Veg;
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

    let name: string = isString(convertedMealWheelSpecItemProperties[2]) ? convertedMealWheelSpecItemProperties[2] : '';
    const veg: string = isString(convertedMealWheelSpecItemProperties[3]) ? convertedMealWheelSpecItemProperties[3] : '';
    const salad: string = isString(convertedMealWheelSpecItemProperties[4]) ? convertedMealWheelSpecItemProperties[4] : '';
    const side: string = isString(convertedMealWheelSpecItemProperties[5]) ? convertedMealWheelSpecItemProperties[5] : '';

    const requiresVeg: boolean = convertedMealWheelSpecItemProperties[6] as boolean;
    const requiresSalad: boolean = convertedMealWheelSpecItemProperties[7] as boolean;
    const requiresSide: boolean = convertedMealWheelSpecItemProperties[8] as boolean;

    if (entityType === MealWheelEntityType.Meal) {

      const mealEntity: MealEntity = {
        id: uuidv4(),
        userId: '',                   // TEDTODO
        mainDishId: '',               // fill in after parsing dishes
        accompanimentDishIds: [],     // fill in after parsing dishes
        mainName: name,
        vegName: veg,
        saladName: salad,
        sideName: side,
      }
      mealEntities.push(mealEntity);
    } else {
      if (dishType === DishType.Main) {
        const mainDish: MainDishEntity = {
          id: uuidv4(),
          userId: '',
          name,
          type: DishType.Main,
          accompanimentRequired: RequiredAccompanimentFlags.None
        }
        if (requiresVeg) {
          mainDish.accompanimentRequired = RequiredAccompanimentFlags.Veg;
        }
        if (requiresSalad) {
          mainDish.accompanimentRequired += RequiredAccompanimentFlags.Salad;
        }
        if (requiresSide) {
          mainDish.accompanimentRequired += RequiredAccompanimentFlags.Side;
        }
        // createMainDishDocument(mainDish);
        dishesByName[name] = mainDish;

      } else {
        switch (dishType) {
          case DishType.Veg:
            name = veg;
            break;
          case DishType.Salad:
            name = salad;
            break;
          case DishType.Side:
            name = side;
            break;
        }
        const baseDish: BaseDishEntity = {
          id: uuidv4(),
          userId: '',
          name,
          type: dishType
        }
        // createBaseDishDocument(baseDish);
        dishesByName[name] = baseDish;
      }
    }

  }

  // return to meals and fill in the accompaniment id's
  for (const mealEntity of mealEntities) {
    mealEntity.mainDishId = dishesByName[mealEntity.mainName].id;
    if (mealEntity.vegName !== '') {
      mealEntity.accompanimentDishIds.push(dishesByName[mealEntity.vegName].id);
    }
    if (mealEntity.saladName !== '') {
      mealEntity.accompanimentDishIds.push(dishesByName[mealEntity.saladName].id);
    }
    if (mealEntity.sideName !== '') {
      console.log('check values here');
      console.log(mealEntity.sideName);
      console.log(dishesByName[mealEntity.sideName]);
      console.log(Object.keys(dishesByName[mealEntity.sideName]));
      console.log(mealEntity.accompanimentDishIds);
      console.log(dishesByName[mealEntity.sideName].id);
      mealEntity.accompanimentDishIds.push(dishesByName[mealEntity.sideName].id);

    }

    // createMealDocument(mealEntity);
  }

  console.log('upload complete');
}



// export function getDishes(request: Request, response: Response) {

//   const id: string = request.query.id as string;

//   return getDishesFromDb(id)
//     .then((dishEntities: DishEntity[]) => {
//       console.log('return from getDishesFromDb, invoke response.json');
//       response.json(dishEntities);
//     });
// }

// export const uploadDishSpec = (request: Request, response: Response, next: any) => {

//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'public');
//     },
//     filename: function (req, file, cb) {
//       cb(null, 'dishes.csv');
//     }
//   });

//   const upload = multer({ storage: storage }).single('file');

//   upload(request, response, function (err) {
//     if (err instanceof multer.MulterError) {
//       return response.status(500).json(err);
//     } else if (err) {
//       return response.status(500).json(err);
//     }
//     console.log('return from upload: ', request.file);

//     const filePath = path.join('public', 'dishes.csv');
//     const content: string = fs.readFileSync(filePath).toString();
//     console.log(content);

//     const result = Papa.parse(content,
//       {
//         header: true,
//         dynamicTyping: true,
//         transform,
//       });
//     console.log(result);
//     processDishes(result.data as ConvertedCSVDish[]);

//     const responseData = {
//       uploadStatus: 'success',
//     };
//     return response.status(200).send(responseData);
//   });

// }

// const processDishes = (convertedDishes: any[]) => {
//   for (const convertedDish of convertedDishes) {

//     const dishName = Object.values(convertedDish)[0].toString();
//     console.log(dishName);

//     let dishEntity: DishEntity;

//     let requiredAccompaniment: RequiredAccompanimentFlags = RequiredAccompanimentFlags.None;
//     if (convertedDish.salad) {
//       requiredAccompaniment = RequiredAccompanimentFlags.Salad;
//     }
//     if (convertedDish.side) {
//       requiredAccompaniment += RequiredAccompanimentFlags.Side;
//     }
//     if (convertedDish.veg) {
//       requiredAccompaniment += RequiredAccompanimentFlags.Veg;
//     }

//     if (requiredAccompaniment !== RequiredAccompanimentFlags.None) {
//       dishEntity = {
//         id: uuidv4(),
//         userId: '',     // TEDTODO
//         name: dishName,
//         type: convertedDish.type,
//         accompaniment: requiredAccompaniment,
//       }
//     } else {
//       dishEntity = {
//         id: uuidv4(),
//         userId: '',     // TEDTODO
//         name: dishName,
//         type: convertedDish.type,
//       }
//     }

//     createDishDocument(dishEntity);
//   }
// }

// A function to apply on each value. The function receives the value as its first argument and the 
// column number or header name when enabled as its second argument. The return value of the function 
// will replace the value it received. The transform function is applied before dynamicTyping.
// convert empty entries in the side, salad, or veg columns to false.
const transform = (arg1: any, arg2: any) => {
  if (arg1 === '') {
    return 'FALSE';
  } else {
    return arg1;
  }
}

export const addDish = (request: Request, response: Response, next: any) => {

  console.log('addDish');
  console.log(request.body);

  const { dish } = request.body;
  // createDishDocument(dish);

  response.sendStatus(200);
}

export const updateDish = (request: Request, response: Response, next: any) => {

  console.log('updateDish');
  console.log(request.body);

  const { dish } = request.body;
  const { id, userId, name, type, accompaniment } = dish;

  updateDishDb(id, userId, name, type, accompaniment);

  response.sendStatus(200);

}

export function getMeals(request: Request, response: Response) {

  const id: string = request.query.id as string;

  return getMealsFromDb(id)
    .then((dishEntities: MealEntity[]) => {
      console.log('return from getMealsFromDb, invoke response.json');
      response.json(dishEntities);
    });
}


export const addMeal = (request: Request, response: Response, next: any) => {

  console.log('addMeal');
  console.log(request.body);

  const { meal } = request.body;
  createMealDocument(meal);

  response.sendStatus(200);
}

export const updateMeal = (request: Request, response: Response, next: any) => {

  console.log('updateMeal');
  console.log(request.body);

  const { meal } = request.body;
  const { id, userId, mealId, mainDishId, accompanimentDishId, dateScheduled, status } = meal;

  updateMealDb(id, userId, mealId, mainDishId, accompanimentDishId, dateScheduled, status);

  response.sendStatus(200);

}

