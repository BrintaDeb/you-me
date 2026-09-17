import React, { useState, useEffect, useCallback, useId } from 'react';
import { X, Check, Search, Image as ImageIcon, Film, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { MediaItem } from '../../services/mediaApi';
import { fetchAllMedia } from '../../services/mediaApi';
import './MediaPoolModal.css';

interface MediaPoolModalProps {
  /** Bearer token for the admin API */
  token: string;
  /** IDs already selected in this section — shown as pre-checked */
  preSelectedIds?: string[];
  /** Called when admin confirms their selection */
  onConfirm: (selected: MediaItem[]) => void;
  onClose: () => void;
}

type FilterType = 'all' | 'image' | 'video';

export const MediaPoolModal: React.FC<MediaPoolModalProps> = ({
  token,
  preSelectedIds = [],
  onConfirm,
  onClose,
}) => {
  const modalTitleId = useId();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preSelectedIds));

  const [refreshKey, setRefreshKey] = useState(0);

  const refreshMedia = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    let active = true;
    // oxlint-disable-next-line react/set-state-in-effect
    setIsLoading(true);
    setError(null);
    fetchAllMedia({
      token,
      type: filterType === 'all' ? undefined : filterType,
      search: searchQuery || undefined,
      page_size: 200,
    })
      .then(res => {
        if (active) setItems(res.items);
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
  }, [token, filterType, searchQuery, refreshKey]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
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
    // Return items in their library order (reordering happens in SectionEditorWidget)
    const selected = items.filter(item => selectedIds.has(item.id));
    onConfirm(selected);
  };

  const resolveUrl = (item: MediaItem) => {
    if (item.url.startsWith('/uploads/')) {
      return import.meta.env.DEV
        ? `http://localhost:8000${item.url}`
        : item.url;
    }
    return item.url;
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
          <button type="button" className="mpm-refresh-btn" onClick={refreshMedia} aria-label="Refresh library">
            <RefreshCw size={14} />
          </button>
        </div>

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
              <p>No media found. Upload files via the Upload tab first.</p>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <div className="mpm-masonry-grid" role="list">
              {items.map(item => {
                const isSelected = selectedIds.has(item.id);
                const url = resolveUrl(item);
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
