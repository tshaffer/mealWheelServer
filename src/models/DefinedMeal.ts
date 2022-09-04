import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const DefinedMealSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    accompanimentDishIds: [],
    mainDishId: { type: String, required: true },
    mainName: { type: String, required: true },
    veggieName: { type: String, required: true },
    saladName: { type: String, required: true },
    sideName: { type: String, required: true },
  },
);

export default mongoose.model('DefinedMeal', DefinedMealSchema);