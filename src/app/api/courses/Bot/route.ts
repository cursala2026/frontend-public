// app/api/courses/bot/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CourseService from '@/lib/services/course.service';

const courseService = new CourseService();

export async function GET() {
  try {
    await dbConnect();
    const courses = await courseService.findForHome();
    
    // Devuelve directamente el array de cursos, como necesita el bot.
    return NextResponse.json(courses);

  } catch (error: any) {
    console.error('Error fetching courses for bot:', error);
    // Devuelve un array vacío en caso de error para no romper el bot.
    return NextResponse.json([], { status: 500 });
  }
}
