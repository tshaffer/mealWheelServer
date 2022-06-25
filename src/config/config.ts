import * as dotenv from 'dotenv';
import { isNil } from 'lodash';
import { MealWheelConfiguration } from '../types';

export let tedClientServerBoilerplateConfiguration: MealWheelConfiguration; 

export const readConfig = (pathToConfigFile: string): void => {

  try {
    const configOutput: dotenv.DotenvConfigOutput = dotenv.config({ path: pathToConfigFile });
    const parsedConfig: dotenv.DotenvParseOutput | undefined = configOutput.parsed;

    if (!isNil(parsedConfig)) {
      tedClientServerBoilerplateConfiguration = {
        PORT: Number(parsedConfig.PORT),
      };
      console.log(tedClientServerBoilerplateConfiguration);
    }
  }
  catch (err) {
    console.log('Dotenv config error: ' + err.message);
  }
};
