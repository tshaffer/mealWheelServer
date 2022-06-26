import { Document } from 'mongoose';
import Dish from '../models/Dish';
import { DishEntity } from '../types';

export const createDishDocument = (dishEntity: DishEntity): Promise<any> => {
  return Dish.create(dishEntity)
    .then((dish: Document) => {
      return Promise.resolve(dish);
    });
};

export const getDishesFromDb = (): Promise<DishEntity[]> => {

  const query = Dish.find({});
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

