// Core types for Journo Journal

export interface User {
  id: string;
  email: string;
  name: string;
  workspace_id?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export type NoteType = 'note' | 'idea' | 'research' | 'interview';
export type NoteStatus = 'draft' | 'in-progress' | 'published';

export interface Note {
  id: string;
  user_id: string;
  workspace_id: string;
  title: string;
  content?: string;
  content_html?: string;
  type: NoteType;
  status: NoteStatus;
  folder_id?: string;
  is_favorite: boolean;
  word_count: number;
  created_at: Date;
  updated_at: Date;
  tags?: Tag[];
  attachments?: Attachment[];
  sources?: Source[];
}

export interface Folder {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  parent_id?: string;
  color?: string;
  created_at: Date;
}

export interface Tag {
  id: string;
  note_id: string;
  tag_name: string;
  auto_generated: boolean;
  confidence_score?: number;
  created_at: Date;
}

export interface Attachment {
  id: string;
  note_id: string;
  file_url: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface Source {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  notes?: string;
  last_contacted?: Date;
  created_at: Date;
  updated_at: Date;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  user_id: string;
  note_id?: string;
  title: string;
  description?: string;
  due_date?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: Date;
  updated_at: Date;
}

export interface Share {
  id: string;
  note_id: string;
  shared_by: string;
  shared_with: string;
  permissions: 'view' | 'edit';
  created_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
