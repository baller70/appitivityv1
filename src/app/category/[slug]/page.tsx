import { CategoryPageContent } from '@/components/category/category-page-content';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  // List of valid category slugs
  const validCategories = [
    'all',
    'favorites', 
    'uncategorized',
    'development',
    'design',
    'productivity',
    'learning',
    'entertainment'
  ];
  
  if (!validCategories.includes(slug)) {
    notFound();
  }
  
  return <CategoryPageContent categorySlug={slug} />;
}

export function generateStaticParams() {
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