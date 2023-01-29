import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const IngredientSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    showInGroceryList: { type: Boolean, required: true },
    ingredients: [{
      id: { type: String, required: true },
    }],
  },
);

export default mongoose.model('Ingredient', IngredientSchema);
