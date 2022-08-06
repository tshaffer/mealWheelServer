import { DishType, RequiredAccompanimentFlags } from '../types';

export interface DishEntity {
  id: string;
  userId: string;
  name: string;
  type: DishType;
  accompaniment?: RequiredAccompanimentFlags;
}

export interface UserEntity {
  id: string;
  userName: string;
  password: string;
  email: string;
}

