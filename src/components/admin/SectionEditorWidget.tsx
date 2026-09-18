import React, { useState, useCallback, useRef } from 'react';
import {
  Images, GripVertical, Trash2, Save, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import type { MediaItem } from '../../services/mediaApi';
import { updateSection } from '../../services/mediaApi';
import { MediaPoolModal } from './MediaPoolModal';
import './SectionEditorWidget.css';

export interface SectionEditorWidgetProps {
  /** Machine key for the section e.g. "hero" | "storyboard" | "films" */
  sectionId: string;
  /** Human-readable display name */
  sectionLabel: string;
  /** Description shown under the label */
  description: string;
  /** Admin JWT token */
  token: string;
  /** Initial media from the last DB fetch (may be empty) */
  initialMedia?: MediaItem[];
  /** Allowed media type constraint (e.g. 'image' for hero) */
  allowedType?: 'image' | 'video';
}

type SaveState = 'idle' | 'saving' | 'success' | 'error';

export const SectionEditorWidget: React.FC<SectionEditorWidgetProps> = ({
  sectionId,
  sectionLabel,
  description,
  token,
  initialMedia = [],
  allowedType,
}) => {
  const [assignedMedia, setAssignedMedia] = useState<MediaItem[]>(initialMedia);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMsg, setSaveMsg] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // ── Native HTML5 drag-and-drop state ────────────────────────────────────
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragIndexRef.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    const srcIdx = dragIndexRef.current;
    if (srcIdx === null || srcIdx === targetIdx) {
      setDragOverIndex(null);
      return;
    }

    setAssignedMedia(prev => {
      const next = [...prev];
      const [moved] = next.splice(srcIdx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });

    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  // ── Modal confirm ────────────────────────────────────────────────────────
  const handleModalConfirm = useCallback((selected: MediaItem[]) => {
    setAssignedMedia(selected);
    setIsModalOpen(false);
    setSaveState('idle');
  }, []);

  // ── Remove single item ───────────────────────────────────────────────────
  const handleRemove = (id: string) => {
    setAssignedMedia(prev => prev.filter(m => m.id !== id));
    setSaveState('idle');
  };

  // ── Save order to backend ────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveState('saving');
    setSaveMsg('');
    try {
      await updateSection(sectionId, assignedMedia.map(m => m.id), token);
      setSaveState('success');
      setSaveMsg(`Saved ${assignedMedia.length} item${assignedMedia.length !== 1 ? 's' : ''} to "${sectionLabel}"`);
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (err) {
      setSaveState('error');
      setSaveMsg(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const resolveThumb = (item: MediaItem) => {
    if (item.url.startsWith('/uploads/')) {
      return import.meta.env.DEV ? `http://localhost:8000${item.url}` : item.url;
    }
    return item.url;
  };

  return (
    <div className={`sew-widget ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Widget header */}
      <div className="sew-header" onClick={() => setIsExpanded(v => !v)}>
        <div className="sew-header-info">
          <Images size={18} className="sew-icon" />
          <div>
            <h4 className="sew-label">{sectionLabel}</h4>
            <p className="sew-desc">{description}</p>
          </div>
        </div>
        <div className="sew-header-right">
          <span className="sew-count-badge">{assignedMedia.length} media</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isExpanded && (
        <div className="sew-body">
          {/* Assigned media strip — drag to reorder */}
          {assignedMedia.length > 0 ? (
            <div className="sew-strip" role="list" aria-label={`${sectionLabel} media order`}>
              {assignedMedia.map((item, idx) => (
                <div
                  key={item.id}
                  className={`sew-thumb-card ${dragOverIndex === idx ? 'drag-over' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={e => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  role="listitem"
                  aria-label={`${item.title || item.filename}, position ${idx + 1}`}
                >
                  <div className="sew-drag-handle" aria-hidden="true">
                    <GripVertical size={13} />
                  </div>
                  <div className="sew-thumb-wrap">
                    <img
                      src={resolveThumb(item)}
                      alt={item.alt_text || item.filename}
                      className="sew-thumb-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="sew-thumb-meta">
                    <span className="sew-thumb-order">#{idx + 1}</span>
                    <span className="sew-thumb-name">{item.title || item.filename}</span>
                  </div>
                  <button
                    type="button"
                    className="sew-remove-btn"
                    onClick={e => { e.stopPropagation(); handleRemove(item.id); }}
                    aria-label={`Remove ${item.title || item.filename}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="sew-empty-hint">
              <Images size={32} style={{ opacity: 0.25 }} />
              <p>No media assigned. Click "Change Media" to select from the library.</p>
            </div>
          )}

          {/* Action bar */}
          <div className="sew-actions">
            <button
              type="button"
              className="btn btn-outline sew-change-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Images size={15} /> Change Media
            </button>

            <button
              type="button"
              className="btn btn-primary sew-save-btn"
              onClick={handleSave}
              disabled={saveState === 'saving'}
            >
              {saveState === 'saving' ? (
                <><Loader2 size={15} className="sew-spinner" /> Saving…</>
              ) : (
                <><Save size={15} /> Save Order</>
              )}
            </button>
          </div>

          {/* Status message */}
          {saveState === 'success' && (
            <div className="sew-status sew-status-success">
              <CheckCircle2 size={14} /> {saveMsg}
            </div>
          )}
          {saveState === 'error' && (
            <div className="sew-status sew-status-error">
              <AlertCircle size={14} /> {saveMsg}
            </div>
          )}
        </div>
      )}

      {/* Media pool modal */}
      {isModalOpen && (
        <MediaPoolModal
          token={token}
          sectionId={sectionId}
          allowedType={allowedType}
          preSelectedIds={assignedMedia.map(m => m.id)}
          onConfirm={handleModalConfirm}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
