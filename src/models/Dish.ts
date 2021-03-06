import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const DishSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    accompaniment: { type: Number },
  },
);

export default mongoose.model('Dish', DishSchema);
