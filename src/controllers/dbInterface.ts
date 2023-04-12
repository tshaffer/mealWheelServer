import { isArray, isNil, isString } from 'lodash';
import { Document } from 'mongoose';

import { MainModel, AccompanimentModel } from '../models/DishModels';
import Ingredient from '../models/Ingredient';
import IngredientInDish from '../models/IngredientInDish';
import ScheduledMeal from '../models/ScheduledMeal';
import {
  AccompanimentDishEntity as AccompanimentEntity,
  MainDishEntity as MainEntity,
  ScheduledMealEntity,
  MealStatus,
  IngredientEntity,
  IngredientInDishEntity,
} from '../types';


export const createScheduledMealDocument = (scheduledMealEntity: ScheduledMealEntity): Promise<Document | void> => {
  return ScheduledMeal.create(scheduledMealEntity)
    .then((scheduledMeal: Document) => {
      return Promise.resolve(scheduledMeal);
    }).catch((err: any) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        console.log('Duplicate key error in createScheduledMealDocument: ', scheduledMealEntity);
      }
      // return Promise.reject(err);
      return Promise.resolve();
    });
}

export const createAccompanimentDocument = (accompanimentEntity: AccompanimentEntity): Promise<Document | void> => {
  console.log('createAccompanimentDocument');
  console.log(accompanimentEntity);
  return AccompanimentModel.create(accompanimentEntity)
    .then((dish: Document) => {
      console.log('successful returned from create');
      return Promise.resolve(dish);
    }).catch((err: any) => {
      console.log(err);
      return Promise.resolve();
    });
};

export const createMainDocument = (mainEntity: MainEntity): Promise<Document | void> => {
  const getExistingDishesPromise: Promise<any> = getMainByNameFromDb(mainEntity.userId, mainEntity.name);
  getExistingDishesPromise
    .then((existingDishes: any) => {
      // console.log('existingDishes: ', existingDishes);
    }).catch((err: any) => {
      console.log('getExistingDishes error: ', err);
    });
  return MainModel.create(mainEntity)
    .then((dish: Document) => {
      return Promise.resolve(dish);
    }).catch((err: any) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        console.log('Duplicate key error in createMainDishDocument: ', mainEntity);
      }
      // return Promise.reject(err);
      return Promise.resolve();
    });
};

// export const updateDishDb = (
//   id: string, 
//   name: string, 
//   type: DishType, 
//   minimumInterval: number, 
//   last: Date | null, 
//   accompaniment: RequiredAccompanimentFlags,
//   prepEffort: number,
//   prepTime: number,
//   cleanupEffort: number,
//   ): void => {
//   Dish.find({ id, }
//     , (err, dishDocs: any) => {
//       if (err) {
//         console.log(err);
//       } else
//         if (isArray(dishDocs) && dishDocs.length === 1) {
//           const dishDoc: any = dishDocs[0];
//           (dishDoc as DishEntity).name = name;
//           (dishDoc as DishEntity).type = type;
//           (dishDoc as DishEntity).minimumInterval = minimumInterval,
//           (dishDoc as DishEntity).last = last,
//           (dishDoc as DishEntity).accompanimentRequired = accompaniment;
//           (dishDoc as DishEntity).prepEffort = prepEffort;
//           (dishDoc as DishEntity).prepTime = prepTime;
//           (dishDoc as DishEntity).cleanupEffort = cleanupEffort;
//           dishDoc.save();
//         }
//     });
// }

// export const deleteDishFromDb = (id: string): void => {
//   Dish.deleteOne({ id }).then(() => {
//     console.log('Deleted dish');
//   }).catch((error: any) => {
//     console.log('Dish deletion failed: ', error);
//   });
// };

export const getScheduledMealsFromDb = (userId: string): Promise<ScheduledMealEntity[]> => {

  const query = ScheduledMeal.find({ userId });
  const promise: Promise<Document[]> = query.exec();
  return promise.then((scheduledMealDocuments: Document[]) => {

    console.log('scheduledMealDocuments');

    const scheduledMealEntities: ScheduledMealEntity[] = scheduledMealDocuments.map((scheduledMealDocument: any) => {
      const scheduledMealEntity: ScheduledMealEntity = scheduledMealDocument.toObject();
      return scheduledMealEntity;
    });

    return Promise.resolve(scheduledMealEntities);
  });
}

const getMainDishesFromDbHelper = (query: any): Promise<MainEntity[]> => {

  const promise: Promise<Document[]> = query.exec();
  return promise.then((mainDishDocuments: Document[]) => {

    const mainDishEntities: MainEntity[] = mainDishDocuments.map((mainDishDocument: any) => {
      const mainDishEntity: MainEntity = mainDishDocument.toObject();
      return mainDishEntity;
    });

    return Promise.resolve(mainDishEntities);
  });

}

const getAccompanimentDishesFromDbHelper = (query: any): Promise<AccompanimentEntity[]> => {

  const promise: Promise<Document[]> = query.exec();
  return promise.then((accompanimentDishDocuments: Document[]) => {

    const accompanimentDishEntities: AccompanimentEntity[] = accompanimentDishDocuments.map((accompanimentDishDocument: any) => {
      const accompanimentDishEntity: AccompanimentEntity = accompanimentDishDocument.toObject();
      return accompanimentDishEntity;
    });

    return Promise.resolve(accompanimentDishEntities);
  });

}

export const getMainDishesFromDb = (userId: string): Promise<MainEntity[]> => {
  const query = MainModel.find({ userId, type: 'main' });
  return getMainDishesFromDbHelper(query);
}

export const getAccompanimentDishesFromDb = (userId: string): Promise<AccompanimentEntity[]> => {
  const query = AccompanimentModel.find({ userId });
  return getAccompanimentDishesFromDbHelper(query);
}

export const getAccompanimentsFromDb = (userId: string): Promise<AccompanimentEntity[]> => {
  const query = AccompanimentModel.find({ userId });
  return getAccompanimentDishesFromDbHelper(query);
}


const getMainByNameFromDb = (userId: string, name: string): Promise<MainEntity[]> => {
  const query = MainModel.find({ userId, name, type: 'main' });
  return getMainDishesFromDbHelper(query);
}

// export const updateMealDb = (
//   id: string,
//   userId: string,
//   mainDishId: string,
//   saladId: string,
//   veggieId: string,
//   sideId: string,
//   dateScheduled: Date,
//   status: MealStatus,
// ): void => {
//   ScheduledMeal.find({ id, }
//     , (err, mealsDocs: any) => {
//       if (err) {
//         console.log(err);
//       } else
//         if (isArray(mealsDocs) && mealsDocs.length === 1) {
//           const mealDoc: any = mealsDocs[0];
//           (mealDoc as ScheduledMealEntity).userId = userId;
//           (mealDoc as ScheduledMealEntity).mainDishId = mainDishId;
//           (mealDoc as ScheduledMealEntity).saladId = saladId;
//           (mealDoc as ScheduledMealEntity).veggieId = veggieId;
//           (mealDoc as ScheduledMealEntity).sideId = sideId;
//           (mealDoc as ScheduledMealEntity).dateScheduled = dateScheduled;
//           (mealDoc as ScheduledMealEntity).status = status;
//           mealDoc.save();
//         }
//     });
// }


export const deleteScheduledMealDb = (
  id: string,
): void => {
  ScheduledMeal.deleteOne({ id }).then(() => {
    console.log('Meal deleted');
  }).catch((error: any) => {
    console.log('Meal deletion failed: ', error);
  });
}

interface MainDishMap {
  [key: string]: MainEntity; // id or name
}

// export const validateDb = () => {
//   const userId = '0';
//   getDishesFromDb(userId)
//     .then((dishes: BaseDishEntity[]) => {
//       const allDishes = dishes;
//       return getMainDishesFromDb(userId)
//         .then((dishes: BaseDishEntity[]) => {
//           const mainDishes = dishes as MainDishEntity[];
//           return getSaladDishesFromDb(userId)
//             .then((dishes: BaseDishEntity[]) => {
//               const saladDishes = dishes;
//               return getVegDishesFromDb(userId)
//                 .then((dishes: BaseDishEntity[]) => {
//                   const veggieDishes = dishes;
//                   return getSideDishesFromDb(userId)
//                     .then((dishes: BaseDishEntity[]) => {
//                       const sideDishes = dishes;
//                       console.log('MAINS');
//                       console.log(mainDishes);
//                       console.log('SALADS');
//                       console.log(saladDishes);
//                       console.log('VEGGIES');
//                       console.log(veggieDishes);
//                       console.log('SIDES');
//                       console.log(sideDishes);
//                       return getDefinedMealsFromDb(userId)
//                         .then((meals: DefinedMealEntity[]) => {
//                           const definedMeals = meals;
//                           return getScheduledMealsFromDb(userId)
//                             .then((meals: ScheduledMealEntity[]) => {
//                               const scheduledMeals = meals;

//                               // data structures available at this point
//                               /*
//                                 allDishes
//                                 mainDishes
//                                 saladDishes
//                                 veggieDishes
//                                 sideDishes
//                                 definedMeals
//                                 scheduledMeals
//                               */
//                               const mainDishById: MainDishMap = {};
//                               const mainDishByName: MainDishMap = {};
//                               for (const mainDish of mainDishes) {
//                                 mainDishById[mainDish.id] = mainDish;
//                                 mainDishByName[mainDish.name] = mainDish;
//                               }

//                               // validate existence of main dishes in defined meals and scheduled meals
//                               for (const definedMeal of definedMeals) {
//                                 if (!isString(definedMeal.mainDishId) || definedMeal.mainDishId === '') {
//                                   console.log('Defined meal has no mainDishId');
//                                   debugger;
//                                 }
//                                 if (isNil(mainDishById[definedMeal.mainDishId])) {
//                                   console.log('Main in defined meal does not exist in mainDishById');
//                                   debugger;
//                                 }
//                                 if (isNil(mainDishByName[definedMeal.mainName])) {
//                                   console.log('Main in defined meal does not exist in mainDishByName');
//                                   debugger;
//                                 }
//                               }

//                               for (const scheduledMeal of scheduledMeals) {
//                                 if (!isString(scheduledMeal.mainDishId) || scheduledMeal.mainDishId === '') {
//                                   console.log('Scheduled meal has no mainDishId');
//                                   debugger;
//                                 }
//                                 if (isNil(mainDishById[scheduledMeal.mainDishId])) {
//                                   console.log('Main in scheduled meal does not exist in mainDishById');
//                                   debugger;
//                                 }
//                               }

//                               console.log('Defined meal and scheduled meal main dishes valid');

//                             });
//                         });
//                     });
//                 });
//             });
//         });
//     });
// };

export const createIngredientDocument = (ingredientEntity: IngredientEntity): Promise<Document | void> => {
  return Ingredient.create(ingredientEntity)
    .then((ingredient: Document) => {
      return Promise.resolve(ingredient);
    }).catch((err: any) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        console.log('Duplicate key error in createIngredientDocument: ', ingredientEntity);
      }
      // return Promise.reject(err);
      return Promise.resolve();
    });
};

export const updateIngredientDb = (ingredientEntity: IngredientEntity): Promise<Document | void> => {
  const { id, userId, name, ingredients, showInGroceryList } = ingredientEntity;
  const query = Ingredient.findOneAndUpdate(
    { id: ingredientEntity.id },
    {
      id,
      userId,
      name,
      ingredients,
      showInGroceryList,
    }
  )
  const promise: Promise<Document[]> = query.exec();
  return promise.then((findOneAndUpdateRetVal: any) => {
    console.log('Ingredients.findOneAndUpdateRetVal returned value:');
    console.log(findOneAndUpdateRetVal);
  }).catch((error: any) => {
    console.log('Ingredients.findOneAndUpdateRetVal returned error:');
    console.log(error);
  });
};

export const getIngredientsFromDb = (userId: string): Promise<IngredientEntity[]> => {

  const query = Ingredient.find({ userId });

  const promise: Promise<Document[]> = query.exec();

  return promise.then((ingredientDocuments: Document[]) => {

    console.log('ingredientDocuments');

    const ingredientEntities: IngredientEntity[] = ingredientDocuments.map((ingredientDocuments: any) => {
      const ingredientEntity: IngredientEntity = ingredientDocuments.toObject();
      return ingredientEntity;
    });

    return Promise.resolve(ingredientEntities);

  });
}


export const createIngredientInDishDocument = (ingredientInDishEntity: IngredientInDishEntity): Promise<Document | void> => {
  return IngredientInDish.create(ingredientInDishEntity)
    .then((ingredientInDish: Document) => {
      return Promise.resolve(ingredientInDish);
    }).catch((err: any) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        console.log('Duplicate key error in createIngredientDocument: ', ingredientInDishEntity);
      }
      // return Promise.reject(err);
      return Promise.resolve();
    });
};

// TODO - rewrite using a single query
// export const getIngredientsByDishFromDb = (userId: string): Promise<any> => {
//   const ingredientsByDishId: any = {};
//   const getDishes: Promise<BaseDishEntity[]> = getDishesFromDb(userId);
//   return getDishes.then((dishes: BaseDishEntity[]) => {
//     const ingredientsInDishesPromises: Promise<any>[] = [];
//     for (const dish of dishes) {
//       ingredientsByDishId[dish.id] = [];
//       const getIngredientsInDishPromise: Promise<IngredientInDishEntity[]> = getIngredientsInDishFromDb(dish.id);
//       ingredientsInDishesPromises.push(getIngredientsInDishPromise);
//     }
//     return Promise.all(ingredientsInDishesPromises).then((ingredientsInDishes) => {
//       getIngredientsInDishes(ingredientsByDishId, ingredientsInDishes);
//       return Promise.resolve(ingredientsByDishId);
//     });
//   });
// }

const getIngredientsInDishFromDb = (dishId: string): Promise<IngredientInDishEntity[]> => {

  const query = IngredientInDish.find({ dishId });

  const promise: Promise<Document[]> = query.exec();

  return promise.then((ingredientsInDishDocuments: Document[]) => {

    const ingredientsInDishEntities: IngredientInDishEntity[] = ingredientsInDishDocuments.map((ingredientInDishDocuments: any) => {
      const ingredientInDishEntity: IngredientInDishEntity = ingredientInDishDocuments.toObject();
      return ingredientInDishEntity;
    });

    return Promise.resolve(ingredientsInDishEntities);

  });
}

const getIngredientsInDish = (ingredientsByDishId: any, dishId: string, ingredientsInDish: any[]) => {
  for (const ingredientInDish of ingredientsInDish) {
    ingredientsByDishId[dishId].push(ingredientInDish.ingredientId)
  }
};

// TODO - further simplification possible
const getIngredientsInDishes = (ingredientsByDishId: any, ingredientsInDishes: any[]) => {
  ingredientsInDishes.forEach((ingredientsInDish: any[]) => {
    if (ingredientsInDish.length > 0) {
      getIngredientsInDish(ingredientsByDishId, ingredientsInDish[0].dishId, ingredientsInDish);
    }
  });
}

export const replaceIngredientInDishDb = (
  dishId: string,
  existingIngredientId: string,
  newIngredientId: string,

) => {
  const query = IngredientInDish.findOneAndUpdate(
    { dishId, ingredientId: existingIngredientId },
    { dishId, ingredientId: newIngredientId }
  )
  const promise: Promise<Document[]> = query.exec();
  return promise.then((findOneAndUpdateRetVal: any) => {
    console.log('IngredientInDish.findOneAndUpdateRetVal returned value:');
    console.log(findOneAndUpdateRetVal);
  }).catch((error: any) => {
    console.log('IngredientInDish.findOneAndUpdateRetVal returned error:');
    console.log(error);
  });
}


export const deleteIngredientFromDishDb = (
  dishId: string,
  ingredientId: string,
): void => {
  IngredientInDish.deleteOne({ dishId, ingredientId }).then(() => {
    console.log('Ingredient deleted from dish');
  }).catch((error: any) => {
    console.log('Ingredient deletion from dish failed: ', error);
  });
}

