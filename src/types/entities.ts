import { DishType, RequiredAccompanimentFlags } from '../types';

export interface DishEntity {
  id: string;
  name: string;
  type: DishType;
  accompaniment?: RequiredAccompanimentFlags;
}
