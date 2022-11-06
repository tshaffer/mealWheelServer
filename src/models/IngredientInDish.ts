import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const IngredientInDishSchema = new Schema(
  {
    dishId: { type: String, required: true },
    ingredientId: { type: String, required: true },
  },
);

export default mongoose.model('IngredientInDish', IngredientInDishSchema);
