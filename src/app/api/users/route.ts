import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// 定义 WorkoutItem Schema
const workoutItemSchema = new mongoose.Schema({
  id: String,
  name: String
});

// 定义 WorkoutDay Schema
const workoutDaySchema = new mongoose.Schema({
  id: String,
  name: String,
  items: [workoutItemSchema]
});

// 定义 User Schema
const userSchema = new mongoose.Schema({
  name: String,
  workoutDays: [workoutDaySchema]
});

// 获取 User 模型（如果已存在则使用现有的）
const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function GET() {
  try {
    await connectDB();
    const users = await User.find();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('获取用户失败:', error);
    return NextResponse.json({ error: '获取用户失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const userData = await request.json();
    
    const newUser = new User(userData);
    await newUser.save();

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const userData = await request.json();
    
    if (!userData._id) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userData._id,
      { $set: userData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 });
  }
} 