import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
    
    let user = new User({ email: 'testdiag@gmail.com', password: 'password123' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash('password123', salt);
    
    await user.save();
    console.log('User saved successfully');
  } catch (err) {
    console.error('DIAGNOSTIC ERROR:', err);
  } finally {
    mongoose.disconnect();
  }
}

run();
