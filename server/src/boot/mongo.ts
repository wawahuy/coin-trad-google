import mongoose from 'mongoose';
import { appConfigs } from '../config/app';
import ModelWorker from '../models/schema/worker';

export default function initMongo() {
  const uri = appConfigs.MONGO_URI;
  
  if (!uri) {
    console.log('mongo - uri null');
    return;
  }

  // , { {useNewUrlParser: true, useUnifiedTopology: true}}
  mongoose.connect(uri);

  mongoose.connection.once('open', () => {
    console.log('MongoDB connected!');
  });

  mongoose.connection.on('error', (error: Error) => {
    console.log(error?.stack?.toString());
  });
}