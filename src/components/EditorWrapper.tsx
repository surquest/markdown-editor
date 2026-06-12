'use client';
import dynamic from 'next/dynamic';

const MilkdownEditor = dynamic(() => import('@/components/MilkdownEditor'), {
  ssr: false,
});

export default function EditorWrapper({ content }: { content: string }) {
  return <MilkdownEditor content={content} />;
}
