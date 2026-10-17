import { notFound } from 'next/navigation';
import LessonReader from '@/components/site/LessonReader.jsx';
import { LESSONS, getLesson } from '@/content/basics/index.js';

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({ params }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  return {
    title: lesson ? lesson.title : 'Field Guides',
    description: lesson?.summary,
  };
}

export default async function LessonPage({ params }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  return <LessonReader lesson={lesson} />;
}
