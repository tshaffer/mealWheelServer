import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const DishSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    minimumInterval: { type: Number, required: true },
    last: { type: Date },
    accompanimentRequired: { type: Number, required: true },
    ingredientIds: { type: [String] },
    prepEffort: { type: Number, required: true },
    prepTime: { type: Number, required: true },
    cleanupEffort: { type: Number, required: true },
  },
);

export default mongoose.model('Olddish', DishSchema);
