import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MealSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    mainDishId: { type: String, required: true },
    accompanimentDishId: { type: String },
    dateScheduled: { type: Date, required: true },  // https://mongoosejs.com/docs/schematypes.html#dates
    status: { type: Number, required: true },
  },
);

export default mongoose.model('Meal', MealSchema);
