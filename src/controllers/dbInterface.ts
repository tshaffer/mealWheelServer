import { isArray } from 'lodash';
import { Document } from 'mongoose';
import DefinedMeal from '../models/DefinedMeal';
import ScheduledMeal from '../models/ScheduledMeal';
import Dish from '../models/Dish';
import {
  BaseDishEntity,
  // DishEntity,
  DishType,
  MainDishEntity,
  ScheduledMealEntity,
  MealStatus,
  RequiredAccompanimentFlags,
  DefinedMealEntity,
} from '../types';

export const createDefinedMealDocument = (definedMealEntity: DefinedMealEntity): Promise<Document> => {
  return DefinedMeal.create(definedMealEntity)
    .then((definedMeal: Document) => {
      return Promise.resolve(definedMeal);
    });
}


export const createScheduledMealDocument = (scheduledMealEntity: ScheduledMealEntity): Promise<Document> => {
  return ScheduledMeal.create(scheduledMealEntity)
    .then((scheduledMeal: Document) => {
      return Promise.resolve(scheduledMeal);
    });
}

export const createMainDishDocument = (dishEntity: MainDishEntity): Promise<Document> => {
  return Dish.create(dishEntity)
    .then((dish: Document) => {
      return Promise.resolve(dish);
    });
};

export const createBaseDishDocument = (dishEntity: BaseDishEntity): Promise<Document> => {
  (dishEntity as MainDishEntity).accompanimentRequired = RequiredAccompanimentFlags.None;
  return Dish.create(dishEntity)
    .then((dish: Document) => {
      return Promise.resolve(dish);
    });
};

export const updateDishDb = (id: string, userId: string, name: string, type: DishType, accompaniment: RequiredAccompanimentFlags): void => {
  Dish.find({ id, }
    , (err, dishDocs: any) => {
      if (err) {
        console.log(err);
      } else
        if (isArray(dishDocs) && dishDocs.length === 1) {
          const dishDoc: any = dishDocs[0];
          // (dishDoc as DishEntity).userId = userId;
          // (dishDoc as DishEntity).name = name;
          // (dishDoc as DishEntity).type = type;
          // (dishDoc as DishEntity).accompaniment = accompaniment;
          dishDoc.save();
        }
    });
}

export const getScheduledMealsFromDb = (userId: string): Promise<ScheduledMealEntity[]> => {

  const query = ScheduledMeal.find({ userId });
  const promise: Promise<Document[]> = query.exec();
  return promise.then((scheduledMealDocuments: Document[]) => {

    console.log('scheduledMealDocuments');

    const scheduledMealEntities: ScheduledMealEntity[] = scheduledMealDocuments.map((scheduledMealDocument: any) => {

      console.log('scheduledMealDocument', scheduledMealDocument);
      const scheduledMealDocAsObj: any = scheduledMealDocument.toObject();
      console.log('scheduledMealDocAsObj', scheduledMealDocAsObj);
      const scheduledMealEntity: ScheduledMealEntity = scheduledMealDocument.toObject();
      console.log('scheduledMealEntity', scheduledMealEntity);

      return scheduledMealEntity;
    });

    console.log(scheduledMealEntities);

    return Promise.resolve(scheduledMealEntities);
  });
}

export const getDefinedMealsFromDb = (userId: string): Promise<DefinedMealEntity[]> => {

  const query = DefinedMeal.find({ userId });
  const promise: Promise<Document[]> = query.exec();
  return promise.then((definedMealDocuments: Document[]) => {

    console.log('definedMealDocuments');

    const definedMealEntities: DefinedMealEntity[] = definedMealDocuments.map((definedMealDocument: any) => {

      console.log('definedMealDocument', definedMealDocument);
      const definedMealDocAsObj: any = definedMealDocument.toObject();
      console.log('definedMealDocAsObj', definedMealDocAsObj);
      const definedMealEntity: DefinedMealEntity = definedMealDocument.toObject();
      console.log('definedMealEntity', definedMealEntity);

      return definedMealEntity;
    });

    console.log(definedMealEntities);

    return Promise.resolve(definedMealEntities);
  });
}

// TEDTODO - proper way to indicate either BaseDishes or MainDishes?
const getDishesFromDbHelper = (query: any): Promise<BaseDishEntity[]> => {

  const promise: Promise<Document[]> = query.exec();
  return promise.then((dishDocuments: Document[]) => {

    console.log('dishDocuments');

    const dishEntities: BaseDishEntity[] = dishDocuments.map((dishDocument: any) => {

      console.log('dishDocument', dishDocument);
      const dishDocAsObj: any = dishDocument.toObject();
      console.log('dishDocAsObj', dishDocAsObj);
      const dishEntity: BaseDishEntity = dishDocument.toObject();
      console.log('dishEntity', dishEntity);

      return dishEntity;
    });

    console.log(dishEntities);

    return Promise.resolve(dishEntities);
  });

}
export const getDishesFromDb = (userId: string): Promise<BaseDishEntity[]> => {
  const query = Dish.find({ userId });
  return getDishesFromDbHelper(query);
}

export const getMainDishesFromDb = (userId: string): Promise<BaseDishEntity[]> => {
  const query = Dish.find({ userId, type: 'main' });
  return getDishesFromDbHelper(query);
}


export const getAccompanimentDishesFromDb = (userId: string): Promise<BaseDishEntity[]> => {
  const query = Dish.find({ $and: [{ userId }, { type: { $ne: 'main' } }] });
  return getDishesFromDbHelper(query);
}

export const getVegDishesFromDb = (userId: string): Promise<BaseDishEntity[]> => {
  const query = Dish.find({ $and: [{ userId }, { type: { $eq: 'veg' } }] });
  return getDishesFromDbHelper(query);
}

export const getSaladDishesFromDb = (userId: string): Promise<BaseDishEntity[]> => {
  const query = Dish.find({ $and: [{ userId }, { type: { $eq: 'salad' } }] });
  return getDishesFromDbHelper(query);
}

export const getSideDishesFromDb = (userId: string): Promise<BaseDishEntity[]> => {
  const query = Dish.find({ $and: [{ userId }, { type: { $eq: 'side' } }] });
  return getDishesFromDbHelper(query);
}

export const updateMealDb = (
  id: string,
  userId: string,
  mealId: string,
  mainDishId: string,
  accompanimentDishId: string | null,
  dateScheduled: Date,
  status: MealStatus,
): void => {
  // Meal.find({ id, }
  //   , (err, mealsDocs: any) => {
  //     if (err) {
  //       console.log(err);
  //     } else
  //       if (isArray(mealsDocs) && mealsDocs.length === 1) {
  //         const mealDoc: any = mealsDocs[0];
  //         (mealDoc as MealEntity).userId = userId;
  //         (mealDoc as MealEntity).mealId = mealId;
  //         (mealDoc as MealEntity).mainDishId = mainDishId;
  //         (mealDoc as MealEntity).accompanimentDishId = accompanimentDishId;
  //         (mealDoc as MealEntity).dateScheduled = dateScheduled;
  //         (mealDoc as MealEntity).status = status;
  //         mealDoc.save();
  //       }
  //   });
}
