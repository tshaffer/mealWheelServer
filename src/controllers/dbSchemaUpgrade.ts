import { isNil } from "lodash";
import Olddish from "../models/Olddish";
import { OldBaseDishEntity, AccompanimentDishEntity, DishType, OldMainDishEntity, RequiredAccompanimentFlags, MainDishEntity } from "../types";
import { createMainDocument, createAccompanimentDocument } from "./dbInterface";

export const upgradeDbSchema = (
  ): Promise<any> => {
    console.log('upgradeDbSchema');
    return getOldDishesFromDb()
      .then((oldDishDocuments: OldBaseDishEntity[]) => {
        console.log('return from getOldDishesFromDb');
        console.log(oldDishDocuments);
        return oldDishDocuments;
      }).then((oldDishDocuments: OldBaseDishEntity[]) => {
        console.log('chained promise');
        const entities: any = generateNewDishesFromOldDishes(oldDishDocuments);
        console.log('Mains');
        console.log(entities.mainDishes);
        console.log('Accompaniments');
        console.log(entities.accompanimentDishes);
        return writeNewDishes(entities.mainDishes, entities.accompanimentDishes);
      });
  }
  
  const getOldDishesFromDb = (): Promise<OldBaseDishEntity[]> => {
    const query = Olddish.find({});
    return getOldDishesFromDbHelper(query);
  }
  
  const generateNewDishesFromOldDishes = (oldDishDocuments: any[]) => {
  
    const mainDishes: MainDishEntity[] = [];
    const accompanimentDishes: AccompanimentDishEntity[] = [];
  
    oldDishDocuments.forEach((oldDishDocument: OldBaseDishEntity) => {
      if (oldDishDocument.type === DishType.Main) {
  
        const oldMain: OldMainDishEntity = oldDishDocument as unknown as OldMainDishEntity;
        const requiresSide: boolean = isNil(oldMain.accompanimentRequired) ? false : (oldMain.accompanimentRequired & RequiredAccompanimentFlags.Side) !== 0;
        const requiresSalad = isNil(oldMain.accompanimentRequired) ? false : (oldMain.accompanimentRequired & RequiredAccompanimentFlags.Salad) !== 0;
        const requiresVeggie = isNil(oldMain.accompanimentRequired) ? false : (oldMain.accompanimentRequired & RequiredAccompanimentFlags.Veggie) !== 0;
        
        let numAccompanimentsRequired = 0;
        const allowableAccompanimentTypeEntityIds: string[] = [];
  
        if (requiresSide) {
          numAccompanimentsRequired++;
          allowableAccompanimentTypeEntityIds.push('side');
        }
        if (requiresSalad) {
          numAccompanimentsRequired++;
          allowableAccompanimentTypeEntityIds.push('salad');
        }
        if (requiresVeggie) {
          numAccompanimentsRequired++;
          allowableAccompanimentTypeEntityIds.push('veggie');
        }
        const mainEntity: MainDishEntity = {
          type: 'main',
          id: oldDishDocument.id,
          userId: oldDishDocument.userId,
          name: oldDishDocument.name,
          minimumInterval: oldDishDocument.minimumInterval,
          last: oldDishDocument.last,
          ingredientIds: oldDishDocument.ingredientIds,
          prepEffort: oldDishDocument.prepEffort,
          prepTime: oldDishDocument.prepTime,
          cleanupEffort: oldDishDocument.cleanupEffort,
          numAccompanimentsRequired,
          allowableAccompanimentTypeEntityIds,
        }
        mainDishes.push(mainEntity);
      } else {
        let type: string = '';
        switch (oldDishDocument.type) {
          case DishType.Salad:
            type = 'salad';
            break;
          case DishType.Side:
            type = 'side';
            break;
          case DishType.Veggie:
            type = 'veggie';
            break;
          default:
            debugger;
        }
        const accompanimentDishEntity: AccompanimentDishEntity = {
          type,
          id: oldDishDocument.id,
          userId: oldDishDocument.userId,
          name: oldDishDocument.name,
          minimumInterval: oldDishDocument.minimumInterval,
          last: oldDishDocument.last,
          ingredientIds: oldDishDocument.ingredientIds,
          prepEffort: oldDishDocument.prepEffort,
          prepTime: oldDishDocument.prepTime,
          cleanupEffort: oldDishDocument.cleanupEffort,
        }
        accompanimentDishes.push(accompanimentDishEntity);
      }
    });
  
    return {
      mainDishes,
      accompanimentDishes,
    };
  };
  
  const writeNewDishes = (mainDishes: MainDishEntity[] = [], accompanimentDishes: AccompanimentDishEntity[]): Promise<any> => {
    
    const promises: Promise<Document | void | any>[] = [];
  
    mainDishes.forEach((mainDish: MainDishEntity) => {
      promises.push(createMainDocument(mainDish));
    });
  
    accompanimentDishes.forEach((accompanimentDish: AccompanimentDishEntity) => {
      promises.push(createAccompanimentDocument(accompanimentDish));
    });
  
    return Promise.all(promises);
  
  }
  
  const getOldMainDishesFromDb = (): Promise<OldBaseDishEntity[]> => {
    const query = Olddish.find({ type: 'main' });
    return getOldDishesFromDbHelper(query);
  }
  
  const getOldAccompanimentDishesFromDb = (): Promise<OldBaseDishEntity[]> => {
    const query = Olddish.find({ type: { $ne: 'main' } });
    return getOldDishesFromDbHelper(query);
  }
  
  const getOldVegDishesFromDb = (): Promise<OldBaseDishEntity[]> => {
    const query = Olddish.find({ type: { $eq: 'veggie' } });
    return getOldDishesFromDbHelper(query);
  }
  
  const getOldSaladDishesFromDb = (): Promise<OldBaseDishEntity[]> => {
    const query = Olddish.find({ type: { $eq: 'salad' } });
    return getOldDishesFromDbHelper(query);
  }
  
  const getOldSideDishesFromDb = (): Promise<OldBaseDishEntity[]> => {
    const query = Olddish.find({ type: { $eq: 'side' } });
    return getOldDishesFromDbHelper(query);
  }
  
  const getOldDishesFromDbHelper = (query: any): Promise<OldBaseDishEntity[]> => {
  
    const promise: Promise<Document[]> = query.exec();
    return promise.then((dishDocuments: Document[]) => {
  
      const dishEntities: OldBaseDishEntity[] = dishDocuments.map((dishDocument: any) => {
        const dishEntity: OldBaseDishEntity = dishDocument.toObject();
        return dishEntity;
      });
  
      return Promise.resolve(dishEntities);
    });
  }
  