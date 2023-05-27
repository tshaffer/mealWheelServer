import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const SuggestedAccompanimentTypesForMainSchema = new Schema(
  {
    mainDishId: { type: String, required: true },
    allowableAccompanimentTypeEntityId: { type: String, required: true },
    count: { type: String, required: true },
  },
);

export default mongoose.model('SuggestedAccompanimentTypesForMain', SuggestedAccompanimentTypesForMainSchema);
