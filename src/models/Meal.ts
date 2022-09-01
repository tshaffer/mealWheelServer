import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

// const accompanimentDishIdSchema = new Schema({ accompanimentDishId: String });

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');

// const MealSchema = new Schema(
//   {
//     id: { type: String },
//     userId: { type: String },
//     accompanimentDishIds: [],
//     mainDishId: { type: String },
//     mainName: { type: String },
//     vegName: { type: String },
//     saladName: { type: String },
//     sideName: { type: String },
//   },
// );

const MealSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    // accompanimentDishIds: [accompanimentDishIdSchema],
    accompanimentDishIds: [],
    mainDishId: { type: String, required: true },
    mainName: { type: String, required: true },
    vegName: { type: String, required: true },
    saladName: { type: String, required: true },
    sideName: { type: String, required: true },
    // accompanimentDishId: { type: String },
    // dateScheduled: { type: Date, required: true },  // https://mongoosejs.com/docs/schematypes.html#dates
    // status: { type: Number, required: true },
  },
);


export default mongoose.model('Meal', MealSchema);
