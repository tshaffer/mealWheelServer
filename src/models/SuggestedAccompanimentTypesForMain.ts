import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const SuggestedAccompanimentTypesForMainSchema = new Schema(
  {
    mainDishId: { type: String, required: true },
    suggestedAccompanimentTypeEntityId: { type: String, required: true },
    count: { type: Number, required: true },
  },
);

export default mongoose.model('SuggestedAccompanimentTypesForMain', SuggestedAccompanimentTypesForMainSchema);
