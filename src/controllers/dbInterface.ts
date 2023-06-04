import { isArray } from 'lodash';
import { Document } from 'mongoose';
import SuggestedAccompanimentTypesForMain from '../models/SuggestedAccompanimentTypesForMain';
import AccompanimentType from '../models/AccompanimentType';

import { MainModel, AccompanimentModel } from '../models/DishModels';
import Ingredient from '../models/Ingredient';
import IngredientInDish from '../models/IngredientInDish';
import ScheduledMeal from '../models/ScheduledMeal';
import {
  AccompanimentDishEntity,
  MainDishEntity,
  ScheduledMealEntity,
  MealStatus,
  IngredientEntity,
  IngredientInDishEntity,
  AccompanimentTypeEntity,
  SuggestedAccompanimentTypeForMainEntityInDb,
  SuggestedAccompanimentTypeForMainSpec,
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

export const createAccompanimentDocument = (accompanimentEntity: AccompanimentDishEntity): Promise<Document | void> => {
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

export const createMainDocument = (mainEntity: MainDishEntity): Promise<Document | void> => {
  const getExistingDishesPromise: Promise<any> = getMainByNameFromDb(mainEntity.userId, mainEntity.name);
  return getExistingDishesPromise
    .then((existingDishes: any) => {
      // console.log('existingDishes: ', existingDishes);
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
    }).catch((err: any) => {
      console.log('getExistingDishes error: ', err);
      return Promise.resolve();
    });
};

export const updateDishDb = (
  id: string,
  name: string,
  type: MainDishEntity,
  minimumInterval: number,
  last: Date | null,
  suggestedAccompanimentTypeSpecs: SuggestedAccompanimentTypeForMainSpec[],
  prepEffort: number,
  prepTime: number,
  cleanupEffort: number,
): void => {
  MainModel.find({ id, }
    , (err, dishDocs: any) => {
      if (err) {
        console.log(err);
      } else
        if (isArray(dishDocs) && dishDocs.length === 1) {
          const dishDoc: any = dishDocs[0];
          (dishDoc as MainDishEntity).name = name;
          (dishDoc as MainDishEntity).minimumInterval = minimumInterval,
            (dishDoc as MainDishEntity).last = last,
            (dishDoc as MainDishEntity).suggestedAccompanimentTypeSpecs = suggestedAccompanimentTypeSpecs;
          (dishDoc as MainDishEntity).prepEffort = prepEffort;
          (dishDoc as MainDishEntity).prepTime = prepTime;
          (dishDoc as MainDishEntity).cleanupEffort = cleanupEffort;
          dishDoc.save();
        }
    });
}

export const deleteDishFromDb = (id: string): void => {
  MainModel.deleteOne({ id }).then(() => {
    console.log('Deleted dish');
  }).catch((error: any) => {
    console.log('Dish deletion failed: ', error);
  });
};

export const getScheduledMealsFromDb = (userId: string): Promise<ScheduledMealEntity[]> => {

  const query = ScheduledMeal.find({ userId });
  const promise: Promise<Document[]> = query.exec();
  return promise.then((scheduledMealDocuments: Document[]) => {

    console.log('scheduledMealDocuments');

    const scheduledMealEntities: ScheduledMealEntity[] = scheduledMealDocuments.map((scheduledMealDocument: any) => {
      const scheduledMealEntity: ScheduledMealEntity = scheduledMealDocument.toObject();
      console.log(scheduledMealEntity);
      return scheduledMealEntity;
    });

    return Promise.resolve(scheduledMealEntities);
  });
}

const getMainDishesFromDbHelper = (query: any): Promise<MainDishEntity[]> => {

  const promise: Promise<Document[]> = query.exec();
  return promise.then((mainDishDocuments: Document[]) => {

    const mainDishEntities: MainDishEntity[] = mainDishDocuments.map((mainDishDocument: any) => {
      const mainDishEntity: MainDishEntity = mainDishDocument.toObject();
      return mainDishEntity;
    });

    return Promise.resolve(mainDishEntities);
  });

}

export const getDishesFromDb = (userId: string): Promise<MainDishEntity[]> => {
  const query = AccompanimentModel.find({ userId });
  return getMainDishesFromDbHelper(query);
}

export const getMainDishesFromDb = (userId: string): Promise<MainDishEntity[]> => {
  const query = MainModel.find({ userId, type: 'main' });
  return getMainDishesFromDbHelper(query);
}

const getAccompanimentTypesFromDbHelper = (query: any): Promise<AccompanimentTypeEntity[]> => {

  const promise: Promise<Document[]> = query.exec();
  return promise.then((accompanimentTypeDocuments: Document[]) => {

    const accompanimentTypeEntities: AccompanimentTypeEntity[] = accompanimentTypeDocuments.map((accompanimentTypeDocument: any) => {
      const accompanimentTypeEntity: AccompanimentTypeEntity = accompanimentTypeDocument.toObject();
      return accompanimentTypeEntity;
    });

    return Promise.resolve(accompanimentTypeEntities);
  });

}


export const getAccompanimentTypesFromDb = (userId: string): Promise<AccompanimentTypeEntity[]> => {
  const query = AccompanimentType.find({
    userId,
  });
  return getAccompanimentTypesFromDbHelper(query);
}


const getMainByNameFromDb = (userId: string, name: string): Promise<MainDishEntity[]> => {
  const query = MainModel.find({ userId, name, type: 'main' });
  return getMainDishesFromDbHelper(query);
}

export const updateMealDb = (
  id: string,
  userId: string,
  mainDishId: string,
  accompanimentDishIds: string[],
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
          (mealDoc as ScheduledMealEntity).accompanimentDishIds = accompanimentDishIds;
          (mealDoc as ScheduledMealEntity).dateScheduled = dateScheduled;
          (mealDoc as ScheduledMealEntity).status = status;
          mealDoc.save();
        }
    });
}


export const deleteScheduledMealDb = (
  id: string,
): void => {
  ScheduledMeal.deleteOne({ id }).then(() => {
    console.log('Meal deleted');
  }).catch((error: any) => {
    console.log('Meal deletion failed: ', error);
  });
}

// interface MainDishMap {
//   [key: string]: MainDishEntity; // id or name
// }

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
export const getIngredientsByDishFromDb = (userId: string): Promise<any> => {
  const ingredientsByDishId: any = {};
  const getDishes: Promise<MainDishEntity[]> = getDishesFromDb(userId);
  return getDishes.then((dishes: MainDishEntity[]) => {
    const ingredientsInDishesPromises: Promise<any>[] = [];
    for (const dish of dishes) {
      ingredientsByDishId[dish.id] = [];
      const getIngredientsInDishPromise: Promise<IngredientInDishEntity[]> = getIngredientsInDishFromDb(dish.id);
      ingredientsInDishesPromises.push(getIngredientsInDishPromise);
    }
    return Promise.all(ingredientsInDishesPromises).then((ingredientsInDishes) => {
      getIngredientsInDishes(ingredientsByDishId, ingredientsInDishes);
      return Promise.resolve(ingredientsByDishId);
    });
  });
}

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

export const createSuggestedAccompanimentTypesForMain = (
  mainDishId: string,
  suggestedAccompanimentTypesForMainEntity: SuggestedAccompanimentTypeForMainSpec[],
): Promise<(Document | void)[]> => {
  console.log('createSuggestedAccompanimentTypesForMain');
  console.log('mainId: ', mainDishId);
  
  const promises: (Promise<Document | void>)[] = [];
  suggestedAccompanimentTypesForMainEntity.forEach((suggestedAccompanimentTypeForMainEntity: SuggestedAccompanimentTypeForMainSpec) => {
    console.log(suggestedAccompanimentTypeForMainEntity.suggestedAccompanimentTypeEntityId);
    console.log(suggestedAccompanimentTypeForMainEntity.count);
    const suggestedAccompanimentTypeForMainEntityInDb: SuggestedAccompanimentTypeForMainEntityInDb = {
      mainDishId,
      suggestedAccompanimentTypeEntityId: suggestedAccompanimentTypeForMainEntity.suggestedAccompanimentTypeEntityId,
      count: suggestedAccompanimentTypeForMainEntity.count,
    };
    const promise = createSuggestedAccompanimentTypeForMain(suggestedAccompanimentTypeForMainEntityInDb);
    promises.push(promise);
  });
  return Promise.all(promises);
};

export const createSuggestedAccompanimentTypeForMain = (
  suggestedAccompanimentTypeForMainEntity: SuggestedAccompanimentTypeForMainEntityInDb)
  : Promise<Document | void> => {
  console.log('createSuggestedAccompanimentTypeForMain invoked');
  console.log(suggestedAccompanimentTypeForMainEntity);
  return SuggestedAccompanimentTypesForMain.create(suggestedAccompanimentTypeForMainEntity)
    .then((suggestedAccompanimentTypeForMainEntityDoc: Document) => {
      console.log('createSuggestedAccompanimentTypeForMain success');
      console.log(suggestedAccompanimentTypeForMainEntityDoc);
      return Promise.resolve(suggestedAccompanimentTypeForMainEntityDoc);
    }).catch((err: any) => {
      console.log('createSuggestedAccompanimentTypeForMain failure');
      console.log(err.name);
      console.log(err.code);
      if (err.name === 'MongoError' && err.code === 11000) {
        console.log('Duplicate key error in createIngredientDocument: ', suggestedAccompanimentTypeForMainEntity);
      }
      // return Promise.reject(err);
      return Promise.resolve();
    });
}

export const getSuggestedAccompanimentTypesForMains = (): Promise<SuggestedAccompanimentTypeForMainEntityInDb[]> => {

  console.log('getSuggestedAccompanimentTypesForMains');

  const query = SuggestedAccompanimentTypesForMain.find({});

  const promise: Promise<Document[]> = query.exec();

  return promise.then((suggestedAccompanimentTypeForMainDocuments: Document[]) => {

    const suggestedAccompanimentTypeForMainEntities: SuggestedAccompanimentTypeForMainEntityInDb[] = suggestedAccompanimentTypeForMainDocuments.map((suggestedAccompanimentTypeForMainDocuments: any) => {
      const suggestedAccompanimentTypeForMainEntity: SuggestedAccompanimentTypeForMainEntityInDb = suggestedAccompanimentTypeForMainDocuments.toObject();
      return suggestedAccompanimentTypeForMainEntity;
    });

    return Promise.resolve(suggestedAccompanimentTypeForMainEntities);

  });
}

