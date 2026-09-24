import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import { X, Check, Search, Image as ImageIcon, Film, Loader2, AlertCircle, RefreshCw, Upload } from 'lucide-react';
import type { MediaItem } from '../../services/mediaApi';
import { fetchAllMedia, uploadMedia, resolveMediaUrl } from '../../services/mediaApi';
import './MediaPoolModal.css';

interface MediaPoolModalProps {
  /** Bearer token for the admin API */
  token: string;
  /** Section ID being configured, e.g. "hero" */
  sectionId?: string;
  /** Allowed media type */
  allowedType?: 'image' | 'video';
  /** IDs already selected in this section — shown as pre-checked */
  preSelectedIds?: string[];
  /** Called when admin confirms their selection */
  onConfirm: (selected: MediaItem[]) => void;
  onClose: () => void;
}

type FilterType = 'all' | 'image' | 'video';

export const MediaPoolModal: React.FC<MediaPoolModalProps> = ({
  token,
  sectionId,
  allowedType,
  preSelectedIds = [],
  onConfirm,
  onClose,
}) => {
  const modalTitleId = useId();
  const isHeroSection = sectionId === 'hero';
  const effectiveAllowedType = allowedType || (isHeroSection ? 'image' : undefined);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>(effectiveAllowedType || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preSelectedIds));
  const [refreshKey, setRefreshKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const refreshMedia = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    let active = true;
    // oxlint-disable-next-line react/set-state-in-effect
    setIsLoading(true);
    setError(null);
    const activeType = effectiveAllowedType || (filterType === 'all' ? undefined : filterType);
    fetchAllMedia({
      token,
      type: activeType,
      search: searchQuery || undefined,
      page_size: 200,
    })
      .then(res => {
        if (!active) return;
        let filtered = res.items;
        if (isHeroSection) {
          filtered = filtered.filter(item => {
            if (item.type !== 'image') return false;
            if (/\.(mp4|webm|ogg|mov)$/i.test(item.url)) return false;
            if (item.url.includes('/posters/') || item.url.toLowerCase().includes('screenshot')) return false;
            return true;
          });
        }
        setItems(filtered);
      })
      .catch(err => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load media library');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, filterType, searchQuery, refreshKey, effectiveAllowedType, isHeroSection]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const selected = items.filter(item => selectedIds.has(item.id));
    onConfirm(selected);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const uploaded = await uploadMedia({
        files: selectedFiles,
        token,
        onProgress: (pct) => setUploadProgress(pct),
      });

      setItems(prev => [...uploaded, ...prev]);
      setSelectedIds(prev => {
        const next = new Set(prev);
        uploaded.forEach(item => next.add(item.id));
        return next;
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please check network/auth.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className="mpm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      onClick={handleBackdropClick}
    >
      <div className="mpm-panel">
        {/* Header */}
        <div className="mpm-header">
          <div>
            <h2 id={modalTitleId} className="mpm-title">Media Library</h2>
            <p className="mpm-subtitle">
              {selectedIds.size} selected · {items.length} total items
            </p>
          </div>
          <button
            type="button"
            className="mpm-close-btn"
            onClick={onClose}
            aria-label="Close media library"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="mpm-toolbar">
          <div className="mpm-search-wrap">
            <Search size={15} className="mpm-search-icon" />
            <input
              type="search"
              className="mpm-search"
              placeholder="Search title or alt text…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search media library"
            />
          </div>
          {!effectiveAllowedType ? (
            <div className="mpm-filter-pills" role="group" aria-label="Filter by type">
              {(['all', 'image', 'video'] as FilterType[]).map(f => (
                <button
                  key={f}
                  type="button"
                  className={`mpm-filter-pill ${filterType === f ? 'active' : ''}`}
                  onClick={() => setFilterType(f)}
                  aria-pressed={filterType === f}
                >
                  {f === 'image' && <ImageIcon size={12} />}
                  {f === 'video' && <Film size={12} />}
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          ) : (
            <div className="mpm-filter-pills" role="status">
              <span className="mpm-filter-pill active" style={{ cursor: 'default' }}>
                <ImageIcon size={12} /> Pure Photographs Only
              </span>
            </div>
          )}
          <button
            type="button"
            className="mpm-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Upload new media"
          >
            {isUploading ? <Loader2 size={13} className="mpm-spinner" /> : <Upload size={13} />}
            <span>{isUploading ? `${uploadProgress}%` : 'Upload'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={effectiveAllowedType === 'image' ? 'image/*' : effectiveAllowedType === 'video' ? 'video/*' : 'image/*,video/*'}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <button type="button" className="mpm-refresh-btn" onClick={refreshMedia} aria-label="Refresh library">
            <RefreshCw size={14} />
          </button>
        </div>

        {uploadError && (
          <div className="mpm-upload-error-banner" role="alert">
            <AlertCircle size={14} />
            <span>{uploadError}</span>
            <button type="button" onClick={() => setUploadError(null)} aria-label="Dismiss error">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="mpm-body">
          {isLoading && (
            <div className="mpm-state-center">
              <Loader2 size={32} className="mpm-spinner" />
              <p>Loading media library…</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="mpm-state-center mpm-error">
              <AlertCircle size={32} />
              <p>{error}</p>
              <button type="button" className="btn btn-outline" onClick={refreshMedia}>Try Again</button>
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="mpm-state-center mpm-empty">
              <ImageIcon size={48} style={{ opacity: 0.3 }} />
              <p>No media found. Upload files above or try a different filter.</p>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <div className="mpm-masonry-grid" role="list">
              {items.map(item => {
                const isSelected = selectedIds.has(item.id);
                const url = resolveMediaUrl(item.url);
                return (
                  <div
                    key={item.id}
                    className={`mpm-media-card ${isSelected ? 'selected' : ''}`}
                    role="listitem"
                    onClick={() => toggleSelect(item.id)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelect(item.id); } }}
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${item.title || item.filename}`}
                  >
                    {item.type === 'video' ? (
                      <div className="mpm-video-thumb">
                        <Film size={28} className="mpm-video-icon" />
                        <span className="mpm-video-label">{item.filename}</span>
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={item.alt_text || item.filename}
                        className="mpm-thumb-img"
                        loading="lazy"
                        decoding="async"
                      />
                    )}

                    {/* Selection overlay */}
                    {isSelected && (
                      <div className="mpm-selected-overlay" aria-hidden="true">
                        <div className="mpm-check-badge">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    {/* Type badge */}
                    <div className="mpm-type-badge" aria-hidden="true">
                      {item.type === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mpm-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
          >
            <Check size={15} />
            Confirm {selectedIds.size} Selection{selectedIds.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
