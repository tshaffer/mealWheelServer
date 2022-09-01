import { isArray } from 'lodash';
import { Document } from 'mongoose';
import Meal from '../models/Meal';
import Dish from '../models/Dish';
import {
  BaseDishEntity,
  // DishEntity,
  DishType,
  MainDishEntity,
  MealEntity,
  MealStatus,
  RequiredAccompanimentFlags,
} from '../types';

export const createMealDocument = (mealEntity: MealEntity): Promise<Document> => {
  return Meal.create(mealEntity)
    .then((meal: Document) => {
      return Promise.resolve(meal);
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

// export const getDishesFromDb = (userId: string): Promise<DishEntity[]> => {

//   const query = Dish.find({ userId });
//   const promise: Promise<Document[]> = query.exec();
//   return promise.then((dishDocuments: Document[]) => {

//     console.log('dishDocuments');

//     const dishEntities: DishEntity[] = dishDocuments.map((dishDocument: any) => {

//       console.log('dishDocument', dishDocument);
//       const dishDocAsObj: any = dishDocument.toObject();
//       console.log('dishDocAsObj', dishDocAsObj);
//       const dishEntity: DishEntity = dishDocument.toObject();
//       console.log('dishEntity', dishEntity);

//       return dishEntity;
//     });

//     console.log(dishEntities);

//     return Promise.resolve(dishEntities);
//   });
// }

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

export const getMealsFromDb = (userId: string): Promise<MealEntity[]> => {

  const query = Meal.find({ userId });
  const promise: Promise<Document[]> = query.exec();
  return promise.then((mealDocuments: Document[]) => {

    console.log('mealDocuments');

    const mealEntities: MealEntity[] = mealDocuments.map((mealDocument: any) => {

      console.log('mealDocument', mealDocument);
      const mealDocAsObj: any = mealDocument.toObject();
      console.log('mealDocAsObj', mealDocAsObj);
      const mealEntity: MealEntity = mealDocument.toObject();
      console.log('mealEntity', mealEntity);

      return mealEntity;
    });

    console.log(mealEntities);

    return Promise.resolve(mealEntities);
  });
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


