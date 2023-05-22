import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const baseDishSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    minimumInterval: { type: Number, required: true },
    last: { type: Date },
    ingredientIds: { type: [String] },
    prepEffort: { type: Number, required: true },
    prepTime: { type: Number, required: true },
    cleanupEffort: { type: Number, required: true },
  },
  { discriminatorKey: 'side' }
);
const BaseDishModel = mongoose.model('BaseDish', baseDishSchema);

const mainDishSchema = new Schema({
  numAccompanimentsRequired: { type: Number, required: true },
  allowableAccompanimentTypeEntityIds: { type: [String], required: true },    // TEDTODO - obsolete
});

// export const AccompanimentModel = mongoose.model('Gen2dish', baseDishSchema);
const MainModel = BaseDishModel.discriminator('maingen2', mainDishSchema);
export default MainModel;
