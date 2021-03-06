import { Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
const path = require('node:path');
import Papa from 'papaparse';

import { getDishesFromDb } from './dbInterface';

import { version } from '../version';
import { ConvertedCSVDish, DishEntity, RequiredAccompanimentFlags } from '../types';
import { createDishDocument } from './dbInterface';

export const getVersion = (request: Request, response: Response, next: any) => {
  console.log('getVersion');
  const data: any = {
    serverVersion: version,
  };
  response.json(data);
};

export function getDishes(request: Request, response: Response) {
  return getDishesFromDb()
    .then((dishEntities: DishEntity[]) => {
      console.log('return from getDishesFromDb, invoke response.json');
      response.json(dishEntities);
    });
}

export const uploadDishSpec = (request: Request, response: Response, next: any) => {

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public');
    },
    filename: function (req, file, cb) {
      cb(null, 'dishes.csv');
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

    const filePath = path.join('public', 'dishes.csv');
    const content: string = fs.readFileSync(filePath).toString();
    console.log(content);

    const result = Papa.parse(content,
      {
        header: true,
        dynamicTyping: true,
        transform,
      });
    console.log(result);
    processDishes(result.data as ConvertedCSVDish[]);

    const responseData = {
      uploadStatus: 'success',
    };
    return response.status(200).send(responseData);
  });

}

// const processDishes = (convertedDishes: ConvertedCSVDish[]) => {
const processDishes = (convertedDishes: any[]) => {
  for (const convertedDish of convertedDishes) {

    const dishName = Object.values(convertedDish)[0].toString();
    console.log(dishName);

    let dishEntity: DishEntity;

    let requiredAccompaniment: RequiredAccompanimentFlags = RequiredAccompanimentFlags.None;
    if (convertedDish.salad) {
      requiredAccompaniment = RequiredAccompanimentFlags.Salad;
    }
    if (convertedDish.side) {
      requiredAccompaniment += RequiredAccompanimentFlags.Side;
    }
    if (convertedDish.veg) {
      requiredAccompaniment += RequiredAccompanimentFlags.Veg;
    }

    if (requiredAccompaniment !== RequiredAccompanimentFlags.None) {
      dishEntity = {
        id: uuidv4(),
        name: dishName,
        type: convertedDish.type,
        accompaniment: requiredAccompaniment,
      }
    } else {
      dishEntity = {
        id: uuidv4(),
        name: dishName,
        type: convertedDish.type,
      }
    }

    createDishDocument(dishEntity);
  }
}

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
