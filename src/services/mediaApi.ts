/**
 * mediaApi.ts — Typed API client for the YOU & ME Studio backend.
 *
 * Base URL detection:
 *  - Development: http://localhost:8000  (Vite runs on :5173, backend on :8000)
 *  - Production:  relative /api          (proxied by vercel/nginx in prod)
 */

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: 'image' | 'video';
  title?: string;
  alt_text?: string;
  file_size?: number;
  mime_type?: string;
  upload_date: string;
}

export interface MediaListResponse {
  items: MediaItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface SectionResponse {
  section_id: string;
  array_of_media_ids: string[];
  media_items: MediaItem[];
  updated_at: string;
}

export interface PublicSectionsResponse {
  sections: Record<string, MediaItem[]>;
  raw_configs: SectionResponse[];
}

export interface AdminLoginResponse {
  token: string;
  token_type: string;
  authenticated: boolean;
  status: string;
}

// ── Base URL ──────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  // In Vite dev mode the backend runs separately on :8000
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  // In production, API is served from the same origin
  return '';
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const base = getBaseUrl();
  const { headers, ...restOptions } = options || {};
  const response = await fetch(`${base}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function adminLogin(passcode: string): Promise<AdminLoginResponse> {
  return apiFetch<AdminLoginResponse>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ passcode }),
  });
}

// ── Media Library ─────────────────────────────────────────────────────────────

export interface UploadMediaOptions {
  files: File[];
  title?: string;
  alt_text?: string;
  token: string;
  onProgress?: (pct: number) => void;
}

/**
 * Upload one or more files to the MediaLibrary.
 * Uses XMLHttpRequest to support upload progress events.
 */
export function uploadMedia({
  files,
  title = '',
  alt_text = '',
  token,
  onProgress,
}: UploadMediaOptions): Promise<MediaItem[]> {
  return new Promise((resolve, reject) => {
    const base = getBaseUrl();
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    if (title) formData.append('title', title);
    if (alt_text) formData.append('alt_text', alt_text);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${base}/api/admin/media/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as MediaItem[]);
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

export interface FetchMediaOptions {
  type?: 'image' | 'video';
  search?: string;
  page?: number;
  page_size?: number;
  token: string;
}

export async function fetchAllMedia({
  type,
  search,
  page = 1,
  page_size = 100,
  token,
}: FetchMediaOptions): Promise<MediaListResponse> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('page_size', String(page_size));

  return apiFetch<MediaListResponse>(`/api/admin/media?${params.toString()}`, {
    headers: authHeaders(token),
  });
}

export async function deleteMedia(id: string, token: string): Promise<void> {
  await apiFetch<unknown>(`/api/admin/media/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ── Section Config ─────────────────────────────────────────────────────────────

export async function updateSection(
  sectionId: string,
  mediaIds: string[],
  token: string,
): Promise<SectionResponse> {
  return apiFetch<SectionResponse>(`/api/admin/sections/${sectionId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ media_ids: mediaIds }),
  });
}

export async function fetchAdminSection(
  sectionId: string,
  token: string,
): Promise<SectionResponse> {
  return apiFetch<SectionResponse>(`/api/admin/sections/${sectionId}`, {
    headers: authHeaders(token),
  });
}

// ── Public ────────────────────────────────────────────────────────────────────

export function resolveMediaUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('/media/') || url.startsWith('/uploads/')) {
    return import.meta.env.DEV ? `http://localhost:8000${url}` : url;
  }
  return url;
}

export async function fetchPublicSections(): Promise<PublicSectionsResponse> {
  return apiFetch<PublicSectionsResponse>('/api/public/sections');
}

export interface PublicStoryItem {
  id: string;
  slug: string;
  title: string;
  legacy_url?: string;
  category: string;
  tagline: string;
  cover_image: string;
  hero_image: string;
  is_featured: boolean;
  video_url?: string;
  video_poster?: string;
  location?: string;
  date?: string;
  image_count: number;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    caption?: string;
  }>;
}

export interface StoriesListResponse {
  items: PublicStoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export async function fetchStories(params?: {
  category?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<StoriesListResponse> {
  const q = new URLSearchParams();
  if (params?.category) q.set('category', params.category);
  if (params?.featured !== undefined) q.set('featured', String(params.featured));
  if (params?.page) q.set('page', String(params.page));
  if (params?.pageSize) q.set('page_size', String(params.pageSize));
  return apiFetch<StoriesListResponse>(`/api/public/stories?${q.toString()}`);
}

export async function fetchStoryBySlug(slug: string): Promise<PublicStoryItem> {
  return apiFetch<PublicStoryItem>(`/api/public/stories/${encodeURIComponent(slug)}`);
}

export async function fetchStudioConfig(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>('/api/public/studio-config');
}

