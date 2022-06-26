import * as dotenv from 'dotenv';
import { isNil } from 'lodash';
import { MealWheelConfiguration } from '../types';

export let mealWheelConfiguration: MealWheelConfiguration; 

export const readConfig = (pathToConfigFile: string): void => {

  try {
    const configOutput: dotenv.DotenvConfigOutput = dotenv.config({ path: pathToConfigFile });
    const parsedConfig: dotenv.DotenvParseOutput | undefined = configOutput.parsed;

    if (!isNil(parsedConfig)) {
      mealWheelConfiguration = {
        PORT: Number(parsedConfig.PORT),
        MONGO_URI: parsedConfig.MONGO_URI,
      };
      console.log(mealWheelConfiguration);
    }
  }
  catch (err) {
    console.log('Dotenv config error: ' + err.message);
  }
};
