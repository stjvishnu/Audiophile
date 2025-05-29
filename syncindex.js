import mongoose from 'mongoose';
import Category from './models/categoryModel.js'; // adjust path as needed

const runOnce = async () => {
  try {
    await mongoose.connect('mongodb+srv://vishnu_stj:0l9g71VY0ZGMGnPW@cluster0.xqx9z.mongodb.net/'); // replace with your URI

    console.log('Connected to DB');

    await Category.syncIndexes(); // 👈 This syncs indexes based on current schema

    console.log('Indexes synced. You can now comment out this code.');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error syncing indexes:', err);
  }
};

runOnce();
