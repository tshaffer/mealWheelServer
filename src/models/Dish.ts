import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const DishSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    requiresOneOf: {
      side: { type: Boolean, required: true },
      salad: { type: Boolean, required: true },
      veg: { type: Boolean, required: true },
    },
  },
);

export default mongoose.model('Dish', DishSchema);
