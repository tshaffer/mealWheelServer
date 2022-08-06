import { isArray } from 'lodash';
import { Document } from 'mongoose';
import Dish from '../models/Dish';
import {
  DishEntity,
  DishType,
  RequiredAccompanimentFlags,
} from '../types';

export const createDishDocument = (dishEntity: DishEntity): Promise<any> => {
  return Dish.create(dishEntity)
    .then((dish: Document) => {
      return Promise.resolve(dish);
    });
};

export const getDishesFromDb = (userId: string): Promise<DishEntity[]> => {

  const query = Dish.find({ userId });
  const promise: Promise<Document[]> = query.exec();
  return promise.then((dishDocuments: Document[]) => {

    console.log('dishDocuments');

    const dishEntities: DishEntity[] = dishDocuments.map((dishDocument: any) => {

      console.log('dishDocument', dishDocument);
      const dishDocAsObj: any = dishDocument.toObject();
      console.log('dishDocAsObj', dishDocAsObj);
      const dishEntity: DishEntity = dishDocument.toObject();
      console.log('dishEntity', dishEntity);

      return dishEntity;
    });

    console.log(dishEntities);

    return Promise.resolve(dishEntities);
  });
}

export const updateDishDb = (id: string, userId: string, name: string, type: DishType, accompaniment: RequiredAccompanimentFlags): void => {
  Dish.find({ id, }
    , (err, dishDocs: any) => {
      if (err) {
        console.log(err);
      } else
        if (isArray(dishDocs) && dishDocs.length === 1) {
          const dishDoc: any = dishDocs[0];
          (dishDoc as DishEntity).userId = userId;
          (dishDoc as DishEntity).name = name;
          (dishDoc as DishEntity).type = type;
          (dishDoc as DishEntity).accompaniment = accompaniment;
          dishDoc.save();
        }
    });
}
