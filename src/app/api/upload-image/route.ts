import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, GIF, WEBP, BMP, SVG' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'حجم الملف كبير جداً. الحد الأقصى 5MB' 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `question_${timestamp}_${randomStr}.${extension}`;

    // Create questions directory if it doesn't exist
    const questionsDir = join(process.cwd(), 'public', 'questions');
    if (!existsSync(questionsDir)) {
      await mkdir(questionsDir, { recursive: true });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    const filepath = join(questionsDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const imageUrl = `/questions/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json({ 
      error: 'فشل رفع الصورة: ' + error.message 
    }, { status: 500 });
  }
}

