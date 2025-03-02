import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('请在 .env.local 文件中添加 MONGODB_URI');
}

const uri = process.env.MONGODB_URI;

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection.asPromise();
    }

    const conn = await mongoose.connect(uri);
    console.log('MongoDB 连接成功');
    return conn;
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    throw error;
  }
}

export default connectDB; 