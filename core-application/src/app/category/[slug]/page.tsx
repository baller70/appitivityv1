import { CategoryPageContent } from '@/components/category/category-page-content';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  // Validate slug format: should be alphanumeric with hyphens, not empty
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    notFound();
  }
  
  return <CategoryPageContent categorySlug={slug} />;
}

export function generateStaticParams() {
  // Generate static params for common categories, but dynamic pages will work too
  return [
    { slug: 'all' },
    { slug: 'favorites' },
    { slug: 'uncategorized' },
    { slug: 'development' },
    { slug: 'design' },
    { slug: 'productivity' },
    { slug: 'learning' },
    { slug: 'entertainment' },
  ];
} 