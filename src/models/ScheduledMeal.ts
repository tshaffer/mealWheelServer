import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const ScheduledMealSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    accompanimentDishIds: [],
    mainDishId: { type: String, required: true },
    mainName: { type: String, required: true },
    veggieName: { type: String, required: true },
    saladName: { type: String, required: true },
    sideName: { type: String, required: true },
    dateScheduled: { type: Date, required: true },  // https://mongoosejs.com/docs/schematypes.html#dates
    status: { type: Number, required: true },
  },
);

export default mongoose.model('ScheduledMeal', ScheduledMealSchema);
