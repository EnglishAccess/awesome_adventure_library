'use server';

import { supabase } from '@/lib/supabase';
import { Book } from '@/types';

const BUCKET = 'books';

export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getBooks error:', error);
    return [];
  }
  return data as Book[];
}

export async function getBook(id: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('getBook error:', error);
    return null;
  }
  return data as Book;
}

export async function uploadBookAction(formData: FormData): Promise<Book> {
  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const description = formData.get('description') as string;
  const level = formData.get('level') as string | null;
  const unit = formData.get('unit') as string | null;
  const fileType = formData.get('fileType') as string;
  const coverFile = formData.get('cover') as File;
  const bookFile = formData.get('book') as File;

  const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

  // Upload book file to Supabase Storage
  const bookExt = bookFile.name.split('.').pop() || 'pdf';
  const bookPath = `${id}_book.${bookExt}`;
  const bookBuffer = Buffer.from(await bookFile.arrayBuffer());

  const { error: bookUploadError } = await supabase.storage
    .from(BUCKET)
    .upload(bookPath, bookBuffer, { contentType: bookFile.type });

  if (bookUploadError) throw new Error(`Book upload failed: ${bookUploadError.message}`);

  // Upload cover file to Supabase Storage
  const coverExt = coverFile.name.split('.').pop() || 'png';
  const coverPath = `${id}_cover.${coverExt}`;
  const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

  const { error: coverUploadError } = await supabase.storage
    .from(BUCKET)
    .upload(coverPath, coverBuffer, { contentType: coverFile.type });

  if (coverUploadError) throw new Error(`Cover upload failed: ${coverUploadError.message}`);

  // Get public URLs
  const { data: bookUrlData } = supabase.storage.from(BUCKET).getPublicUrl(bookPath);
  const { data: coverUrlData } = supabase.storage.from(BUCKET).getPublicUrl(coverPath);

  const newBook: Omit<Book, 'created_at'> & { created_at?: string } = {
    id,
    title,
    author,
    description,
    level: level || null,
    unit: unit || null,
    cover_url: coverUrlData.publicUrl,
    file_url: bookUrlData.publicUrl,
    file_type: fileType as 'pdf' | 'text',
    view_count: 0,
  };

  const { data, error } = await supabase
    .from('books')
    .insert(newBook)
    .select()
    .single();

  if (error) throw new Error(`DB insert failed: ${error.message}`);

  return data as Book;
}

export async function deleteBookAction(id: string) {
  // Delete the record from DB
  const { data: book } = await supabase.from('books').select('*').eq('id', id).single();

  if (book) {
    // Attempt to remove files from storage (best-effort)
    const bookPath = book.file_url?.split('/').pop();
    const coverPath = book.cover_url?.split('/').pop();
    if (bookPath) await supabase.storage.from(BUCKET).remove([bookPath]);
    if (coverPath) await supabase.storage.from(BUCKET).remove([coverPath]);
  }

  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

// 認証モック（将来的にSupabase Authに置き換え可能）
export async function mockLogin() {
  return true;
}
