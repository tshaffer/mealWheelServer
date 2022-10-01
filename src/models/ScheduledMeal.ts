import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

/*
    saladId: { type: String, required: true },
    veggieId: { type: String, required: true },
    sideId: { type: String, required: true },
*/

const ScheduledMealSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    mainDishId: { type: String, required: true },
    saladId: { type: String },
    veggieId: { type: String },
    sideId: { type: String },
    dateScheduled: { type: Date, required: true },  // https://mongoosejs.com/docs/schematypes.html#dates
    status: { type: Number, required: true },
  },
);

export default mongoose.model('ScheduledMeal', ScheduledMealSchema);
