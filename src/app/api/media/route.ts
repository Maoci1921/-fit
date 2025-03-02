import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// 定义 Media 模型的 Schema
const mediaSchema = new mongoose.Schema({
  name: String,
  type: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});

// 获取 Media 模型（如果已存在则使用现有的）
const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);

export async function GET() {
  try {
    await connectDB();
    const media = await Media.find({});
    return NextResponse.json({ media });
  } catch (error) {
    console.error('获取媒体失败:', error);
    return NextResponse.json({ error: '获取媒体失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    const newMedia = new Media(data);
    await newMedia.save();

    return NextResponse.json(newMedia);
  } catch (error) {
    console.error('创建媒体失败:', error);
    return NextResponse.json({ error: '创建媒体失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少媒体ID' }, { status: 400 });
    }

    const result = await Media.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: '媒体不存在' }, { status: 404 });
    }

    return NextResponse.json({ message: '媒体删除成功' });
  } catch (error) {
    console.error('删除媒体失败:', error);
    return NextResponse.json({ error: '删除媒体失败' }, { status: 500 });
  }
} 