import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

interface WorkoutItem {
  id: string;
  name: string;
}

interface WorkoutDay {
  id: string;
  name: string;
  items: WorkoutItem[];
}

interface User {
  _id?: ObjectId;
  name: string;
  workoutDays: WorkoutDay[];
}

async function connectDB() {
  try {
    await client.connect();
    return client.db('fitness-planner');
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw new Error('数据库连接失败');
  }
}

export async function GET() {
  try {
    const db = await connectDB();
    const users = await db.collection('users').find().toArray();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('获取用户失败:', error);
    return NextResponse.json({ error: '获取用户失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userData: Omit<User, '_id'> = await request.json();
    if (!userData.name || !Array.isArray(userData.workoutDays)) {
      return NextResponse.json({ error: '无效的用户数据' }, { status: 400 });
    }

    const db = await connectDB();
    const result = await db.collection('users').insertOne(userData);
    const savedUser = await db.collection('users').findOne({ _id: result.insertedId });
    
    return NextResponse.json(savedUser);
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const db = await connectDB();
    const user = await request.json();
    
    if (!user._id) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const { _id, ...updateData } = user;
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const db = await connectDB();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 });
  }
} 