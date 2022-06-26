import mongoose from 'mongoose';

const connectDB = async () => {
  console.log('uri is:');
  console.log(process.env.MONGO_URI);
  const conn = await mongoose.connect(
    // process.env.MONGO_URI,
    'mongodb+srv://ted:1s1GqO18mmEnt5v1@cluster0-ihsik.mongodb.net/mealwheel?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

  console.log(`MongoDB Connected`);
};

export default connectDB;
