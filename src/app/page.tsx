import { Book } from '@/types';
import { getBooks } from '@/app/actions';
import LibraryView from '@/components/library/LibraryView';

export const revalidate = 0; // Disable cache for now

export default async function Home() {
  const books = await getBooks();

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner or Hero Section could go here */}

      <LibraryView initialBooks={books} />
    </div>
  );
}
