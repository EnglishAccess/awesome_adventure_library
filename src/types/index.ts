export type Book = {
    id: string;
    title: string;
    author: string;
    description: string | null;
    cover_url: string | null;
    file_url: string | null;
    file_type: 'pdf' | 'text';
    textbook?: string | null;
    level?: string | null;
    unit?: string | null;
    view_count: number;
    created_at: string;
};

export type Announcement = {
    id: string;
    message: string;
    link_url: string | null;
    is_active: boolean;
    start_at: string | null;
    end_at: string | null;
    created_at: string;
};
