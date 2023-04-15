import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

const AccompanimentTypeSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    uiIndex: { type: Number, required: true },
  },
);

export default mongoose.model('AccompanimentType', AccompanimentTypeSchema);
