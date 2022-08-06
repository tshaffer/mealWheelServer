import { Request, Response } from 'express';
import { isArray } from 'lodash';
import User from '../models/User';
import { UserEntity } from '../types';

export const getUsers = (request: Request, response: Response, next: any) => {
  console.log('getUsers');

  getUsersFromDb()
    .then((users: UserEntity[]) => {
      console.log('users');
      console.log(users);
      response.json(users);
    })
};

const getUsersFromDb = (): Promise<UserEntity[]> => {

  const users: UserEntity[] = [];

  const query = User.find({});
  const promise = query.exec();
  return promise
    .then((userDocs: any[]) => {
      if (isArray(userDocs) && userDocs.length > 0) {
        for (const userDoc of userDocs) {
          const userDocData: any = userDoc.toObject();
          const user: UserEntity = {
            id: userDocData.id,
            userName: userDocData.userName,
            password: userDocData.password,
            email: userDocData.email,
          }
          users.push(user);
        }
        return Promise.resolve(users);
      } else {
        debugger;
        return Promise.reject('users not found');
      }
    }).catch((err: any) => {
      console.log(err);
      debugger;
      return Promise.reject(err);
    });
}

