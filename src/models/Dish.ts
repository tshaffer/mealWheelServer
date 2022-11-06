import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const DishSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    accompanimentRequired: { type: Number, required: true },
    ingredients: [{
      ingredientId: { type: String, required: true },
    }],
  },
);

export default mongoose.model('Dish', DishSchema);
