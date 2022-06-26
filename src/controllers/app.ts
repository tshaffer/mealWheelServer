import { Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs';
const path = require('node:path');
import Papa from 'papaparse';

import { getDishesFromDb } from './dbInterface';


import { version } from '../version';
import { ConvertedCSVDish, DishEntity } from '../types';
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
    // TEDTODO
    const flibbo = Object.values(convertedDish)[0].toString();
    console.log(flibbo);
    const dishEntity: DishEntity = {
      name: flibbo,
      type: convertedDish.type,
      requiresOneOf: {
        side: convertedDish.salad,
        salad: convertedDish.salad,
        veg: convertedDish.veg,
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
