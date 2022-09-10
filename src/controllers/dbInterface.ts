import { isArray, isNil, isString } from 'lodash';
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

      // console.log('scheduledMealDocument', scheduledMealDocument);
      const scheduledMealDocAsObj: any = scheduledMealDocument.toObject();
      // console.log('scheduledMealDocAsObj', scheduledMealDocAsObj);
      const scheduledMealEntity: ScheduledMealEntity = scheduledMealDocument.toObject();
      // console.log('scheduledMealEntity', scheduledMealEntity);

      return scheduledMealEntity;
    });

    // console.log(scheduledMealEntities);

    return Promise.resolve(scheduledMealEntities);
  });
}

export const getDefinedMealsFromDb = (userId: string): Promise<DefinedMealEntity[]> => {

  const query = DefinedMeal.find({ userId });
  const promise: Promise<Document[]> = query.exec();
  return promise.then((definedMealDocuments: Document[]) => {

    console.log('definedMealDocuments');

    const definedMealEntities: DefinedMealEntity[] = definedMealDocuments.map((definedMealDocument: any) => {

      // console.log('definedMealDocument', definedMealDocument);
      const definedMealDocAsObj: any = definedMealDocument.toObject();
      // console.log('definedMealDocAsObj', definedMealDocAsObj);
      const definedMealEntity: DefinedMealEntity = definedMealDocument.toObject();
      // console.log('definedMealEntity', definedMealEntity);

      return definedMealEntity;
    });

    // console.log(definedMealEntities);

    return Promise.resolve(definedMealEntities);
  });
}

// TEDTODO - proper way to indicate either BaseDishes or MainDishes?
const getDishesFromDbHelper = (query: any): Promise<BaseDishEntity[]> => {

  const promise: Promise<Document[]> = query.exec();
  return promise.then((dishDocuments: Document[]) => {

    console.log('dishDocuments');

    const dishEntities: BaseDishEntity[] = dishDocuments.map((dishDocument: any) => {

      // console.log('dishDocument', dishDocument);
      const dishDocAsObj: any = dishDocument.toObject();
      // console.log('dishDocAsObj', dishDocAsObj);
      const dishEntity: BaseDishEntity = dishDocument.toObject();
      // console.log('dishEntity', dishEntity);

      return dishEntity;
    });

    // console.log(dishEntities);

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
  const query = Dish.find({ $and: [{ userId }, { type: { $eq: 'veggie' } }] });
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
  mainDishId: string,
  saladId: string,
  veggieId: string,
  sideId: string,
  dateScheduled: Date,
  status: MealStatus,
): void => {
  ScheduledMeal.find({ id, }
    , (err, mealsDocs: any) => {
      if (err) {
        console.log(err);
      } else
        if (isArray(mealsDocs) && mealsDocs.length === 1) {
          const mealDoc: any = mealsDocs[0];
          (mealDoc as ScheduledMealEntity).userId = userId;
          (mealDoc as ScheduledMealEntity).mainDishId = mainDishId;
          (mealDoc as ScheduledMealEntity).saladId = saladId;
          (mealDoc as ScheduledMealEntity).veggieId = veggieId;
          (mealDoc as ScheduledMealEntity).sideId = sideId;
          (mealDoc as ScheduledMealEntity).dateScheduled = dateScheduled;
          (mealDoc as ScheduledMealEntity).status = status;
          mealDoc.save();
        }
    });
}


interface MainDishMap {
  [key: string]: MainDishEntity; // id or name
}

export const validateDb = () => {
  const userId = '0';
  getDishesFromDb(userId)
    .then((dishes: BaseDishEntity[]) => {
      const allDishes = dishes;
      return getMainDishesFromDb(userId)
        .then((dishes: BaseDishEntity[]) => {
          const mainDishes = dishes as MainDishEntity[];
          return getSaladDishesFromDb(userId)
            .then((dishes: BaseDishEntity[]) => {
              const saladDishes = dishes;
              return getVegDishesFromDb(userId)
                .then((dishes: BaseDishEntity[]) => {
                  const veggieDishes = dishes;
                  return getSideDishesFromDb(userId)
                    .then((dishes: BaseDishEntity[]) => {
                      const sideDishes = dishes;
                      console.log('MAINS');
                      console.log(mainDishes);
                      console.log('SALADS');
                      console.log(saladDishes);
                      console.log('VEGGIES');
                      console.log(veggieDishes);
                      console.log('SIDES');
                      console.log(sideDishes);
                      return getDefinedMealsFromDb(userId)
                        .then((meals: DefinedMealEntity[]) => {
                          const definedMeals = meals;
                          return getScheduledMealsFromDb(userId)
                            .then((meals: ScheduledMealEntity[]) => {
                              const scheduledMeals = meals;

                              // data structures available at this point
                              /*
                                allDishes
                                mainDishes
                                saladDishes
                                veggieDishes
                                sideDishes
                                definedMeals
                                scheduledMeals
                              */
                              const mainDishById: MainDishMap = {};
                              const mainDishByName: MainDishMap = {};
                              for (const mainDish of mainDishes) {
                                mainDishById[mainDish.id] = mainDish;
                                mainDishByName[mainDish.name] = mainDish;
                              }

                              // validate existence of main dishes in defined meals and scheduled meals
                              for (const definedMeal of definedMeals) {
                                if (!isString(definedMeal.mainDishId) || definedMeal.mainDishId === '') {
                                  console.log('Defined meal has no mainDishId');
                                  debugger;
                                }
                                if (isNil(mainDishById[definedMeal.mainDishId])) {
                                  console.log('Main in defined meal does not exist in mainDishById');
                                  debugger;
                                }
                                if (isNil(mainDishByName[definedMeal.mainName])) {
                                  console.log('Main in defined meal does not exist in mainDishByName');
                                  debugger;
                                }
                              }

                              for (const scheduledMeal of scheduledMeals) {
                                if (!isString(scheduledMeal.mainDishId) || scheduledMeal.mainDishId === '') {
                                  console.log('Scheduled meal has no mainDishId');
                                  debugger;
                                }
                                if (isNil(mainDishById[scheduledMeal.mainDishId])) {
                                  console.log('Main in scheduled meal does not exist in mainDishById');
                                  debugger;
                                }
                              }

                              console.log('Defined meal and scheduled meal main dishes valid');

                            });
                        });
                    });
                });
            });
          });
        });
    };