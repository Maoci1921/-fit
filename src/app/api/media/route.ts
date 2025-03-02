import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('fitness-planner');
    const media = await db.collection('media').find({}).toArray();
    return NextResponse.json({ media });
  } catch (error) {
    console.error('获取媒体失败:', error);
    return NextResponse.json({ error: '获取媒体失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('fitness-planner');
    const data = await request.json();
    
    const result = await db.collection('media').insertOne({
      ...data,
      _id: new ObjectId(),
      createdAt: new Date(),
    });

    const newMedia = await db.collection('media').findOne({ _id: result.insertedId });
    return NextResponse.json(newMedia);
  } catch (error) {
    console.error('创建媒体失败:', error);
    return NextResponse.json({ error: '创建媒体失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('fitness-planner');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少媒体ID' }, { status: 400 });
    }

    await db.collection('media').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: '媒体删除成功' });
  } catch (error) {
    console.error('删除媒体失败:', error);
    return NextResponse.json({ error: '删除媒体失败' }, { status: 500 });
  }
} 