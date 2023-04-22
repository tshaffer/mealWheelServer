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
  allowableAccompanimentTypes: { type: [String], required: true },
});

export const AccompanimentModel = mongoose.model('BaseDish', baseDishSchema);
export const MainModel = BaseDishModel.discriminator('main', mainDishSchema);

// const options = { discriminatorKey: 'kind' };

// const dishSchema = new Schema(
//   {
//     id: { type: String, required: true },
//     userId: { type: String, required: true },
//     name: { type: String, required: true, unique: true },
//     type: { type: String, required: true },
//     minimumInterval: { type: Number, required: true },
//     last: { type: Date },
//     ingredientIds: { type: [String] },
//     prepEffort: { type: Number, required: true },
//     prepTime: { type: Number, required: true },
//     cleanupEffort: { type: Number, required: true },
//   },
// );

// export const AccompanimentDish = mongoose.model('AccompanimentDish', dishSchema);

// export const MainDish = AccompanimentDish.discriminator('MainDish',
//   new mongoose.Schema(
//     {
//       numAccompanimentsRequired: { type: Number, required: true },
//       allowableAccompanimentTypes: { type: [Number], required: true },
//     },
//     options));

/*
    const baseSchema = new Schema({}, { discriminatorKey: 'type' });
    const BaseModel = mongoose.model('Test', baseSchema);
    
    const personSchema = new Schema({ name: String });
    const PersonModel = BaseModel.discriminator('Person', personSchema);
    
    const doc = new PersonModel({ name: 'James T. Kirk' });
    doc.type; // 'Person'
*/