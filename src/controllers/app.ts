import { Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs';
const path = require('node:path');

import Papa from 'papaparse';

import { version } from '../version';

export const getVersion = (request: Request, response: Response, next: any) => {
  console.log('getVersion');
  const data: any = {
    serverVersion: version,
  };
  response.json(data);
};

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

    const result = Papa.parse(content);
    console.log(result);

    // Papa.parse(file, {
    //   complete: function(results) {
    //     console.log("Finished:", results.data);
    //   }
    // });

    const responseData = {
      uploadStatus: 'success',
    };
    return response.status(200).send(responseData);
  });

}
