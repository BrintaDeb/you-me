import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Lock,
  Upload,
  FolderArchive,
  Film,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  LogOut,
  Sparkles,
  Layers,
  Key,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Edit3,
  X,
  Eye,
  ArrowRight,
  BarChart3,
  Heart,
  Share2,
  Users,
  Flame,
  BookOpen
} from 'lucide-react';
import JSZip from 'jszip';
import type { WeddingStory, WeddingImage } from '../data/couplesData';
import { galleryStorage } from '../utils/galleryStorage';
import { triggerHaptic } from '../utils/haptics';
import './AdminPanelPage.css';

interface AdminPanelPageProps {
  onBackToHome: () => void;
  onNavigateToClientLounge?: (pin?: string) => void;
}

const DEFAULT_ADMIN_PASSCODE = 'admin77';

interface ExtractedFilePreview {
  id: string;
  name: string;
  url: string;
  size: string;
}

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({
  onBackToHome,
  onNavigateToClientLounge
}) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('youandme_admin_authenticated') === 'true';
  });
  const [authError, setAuthError] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);

  const handleQuickAdminLogin = () => {
    setPasscode('admin77');
    setIsAuthenticated(true);
    setAuthError(false);
    sessionStorage.setItem('youandme_admin_authenticated', 'true');
    triggerHaptic('success');
  };

  const handleCopyPasscode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('admin77');
      setCopiedPasscode(true);
      triggerHaptic('light');
      setTimeout(() => setCopiedPasscode(false), 2000);
    }
  };

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'upload' | 'collections' | 'new-couple' | 'analytics'>('upload');

  // Stories and PINs state
  const [stories, setStories] = useState<WeddingStory[]>([]);
  const [pinsMap, setPinsMap] = useState<Record<string, string>>({});
  const [subPinsMap, setSubPinsMap] = useState<Record<string, { couplePin: string; familyPin: string; guestPin: string }>>({});
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [copiedPinKey, setCopiedPinKey] = useState<string | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');

  // Upload state
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [extractedPhotos, setExtractedPhotos] = useState<ExtractedFilePreview[]>([]);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoPosterInput, setVideoPosterInput] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // Managing existing photos modal
  const [isManagePhotosModalOpen, setIsManagePhotosModalOpen] = useState(false);

  // Quick edit PIN & film modal
  const [isEditStoryModalOpen, setIsEditStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<WeddingStory | null>(null);
  const [editPinInput, setEditPinInput] = useState('');
  const [editVideoUrlInput, setEditVideoUrlInput] = useState('');

  // New Couple Form state
  const [newCoupleName, setNewCoupleName] = useState('');
  const [newCoupleCategory, setNewCoupleCategory] = useState('Bengali Wedding');
  const [newCoupleDate, setNewCoupleDate] = useState('');
  const [newCoupleLocation, setNewCoupleLocation] = useState('');
  const [newCoupleTagline, setNewCoupleTagline] = useState('');
  const [newCouplePin, setNewCouplePin] = useState('');
  const [newCoupleCoverUrl, setNewCoupleCoverUrl] = useState('');
  const [newCoupleVideoUrl, setNewCoupleVideoUrl] = useState('');
  const [newCoupleCoverPreview, setNewCoupleCoverPreview] = useState('');
  const [coupleSuccessMessage, setCoupleSuccessMessage] = useState('');

  const zipInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Load sub-pins for all stories
  const loadSubPinsForStories = async (storyList: WeddingStory[]) => {
    const map: Record<string, { couplePin: string; familyPin: string; guestPin: string }> = {};
    for (const s of storyList) {
      map[s.id] = await galleryStorage.getSubPinsForStory(s.id);
    }
    setSubPinsMap(map);
  };

  // Load unified stories and PINs
  const refreshStories = React.useCallback(async () => {
    const all = await galleryStorage.getUnifiedStories();
    const pins = await galleryStorage.getAllPins();
    setStories(all);
    setPinsMap(pins);
    setSelectedStoryId(prev => (!prev && all.length > 0 ? all[0].id : prev));
    loadSubPinsForStories(all);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      galleryStorage.getUnifiedStories().then(all => {
        if (!isMounted) return;
        setStories(all);
        setSelectedStoryId(prev => (!prev && all.length > 0 ? all[0].id : prev));
        loadSubPinsForStories(all);
      });
      galleryStorage.getAllPins().then(pins => {
        if (!isMounted) return;
        setPinsMap(pins);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleCopyPin = (pin: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopiedPinKey(key);
      triggerHaptic('light');
      setTimeout(() => setCopiedPinKey(null), 2000);
    }
  };

  const handleCopyWhatsAppInvite = (story: WeddingStory, pins: { couplePin: string; familyPin: string; guestPin: string }) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text =
      `✨ YOU & ME Studios — Private Wedding Collection ✨\n\n` +
      `Dear ${story.title},\n` +
      `Your private wedding sanctuary is live! Enter using your personal access codes:\n\n` +
      `🗝️ Couple Master Suite PIN: ${pins.couplePin}\n` +
      `👨‍👩‍👧 Family Sanctuary PIN: ${pins.familyPin}\n` +
      `🎉 Guest Celebration PIN: ${pins.guestPin}\n\n` +
      `Enter suite: ${origin}/client-lounge\n\n` +
      `Warm regards,\nYOU & ME Atelier Team`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedInviteId(story.id);
      triggerHaptic('success');
      setTimeout(() => setCopiedInviteId(null), 2500);
    }
  };

  // Handle Passcode Login
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === DEFAULT_ADMIN_PASSCODE || passcode === 'admin2026') {
      setIsAuthenticated(true);
      setAuthError(false);
      sessionStorage.setItem('youandme_admin_authenticated', 'true');
      triggerHaptic('success');
    } else {
      setAuthError(true);
      triggerHaptic('warning');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('youandme_admin_authenticated');
    triggerHaptic('light');
  };

  // Convert File to Base64/DataURL for robust persistence
  const fileToDataUrl = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle File or ZIP Selection
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadSuccessMessage('');
    const fileList = Array.from(files);
    const zipFile = fileList.find(f => f.name.toLowerCase().endsWith('.zip'));

    if (zipFile) {
      // Process ZIP Archive
      setIsProcessingZip(true);
      setZipProgress(10);
      triggerHaptic('medium');

      try {
        const zip = await JSZip.loadAsync(zipFile);
        const imageFiles = Object.entries(zip.files).filter(([name, data]) => {
          if (data.dir) return false;
          const lower = name.toLowerCase();
          return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp');
        });

        const total = imageFiles.length;
        if (total === 0) {
          alert('No supported image files (.jpg, .png, .webp) were found inside this ZIP file.');
          setIsProcessingZip(false);
          return;
        }

        const extracted: ExtractedFilePreview[] = [];
        let completed = 0;

        for (const [filename, fileData] of imageFiles) {
          const blob = await fileData.async('blob');
          const dataUrl = await fileToDataUrl(blob);
          const cleanName = filename.split('/').pop()?.split('\\').pop() || filename;

          extracted.push({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: cleanName,
            url: dataUrl,
            size: `${(blob.size / 1024).toFixed(0)} KB`
          });

          completed++;
          setZipProgress(Math.round((completed / total) * 100));
        }

        setExtractedPhotos(prev => [...prev, ...extracted]);
        triggerHaptic('success');
      } catch (err) {
        console.error(err);
        alert('Failed to process ZIP archive. Please verify the archive is valid and uncorrupted.');
      } finally {
        setIsProcessingZip(false);
        setZipProgress(0);
      }
    } else {
      // Process regular images
      const extracted: ExtractedFilePreview[] = [];
      for (const file of fileList) {
        if (file.type.startsWith('image/')) {
          const dataUrl = await fileToDataUrl(file);
          extracted.push({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            url: dataUrl,
            size: `${(file.size / 1024).toFixed(0)} KB`
          });
        }
      }
      setExtractedPhotos(prev => [...prev, ...extracted]);
      triggerHaptic('light');
    }
  };

  // Commit Extracted Photos to Selected Couple
  const handleCommitPhotos = async () => {
    if (!selectedStoryId) {
      alert('Please select a couple collection first.');
      return;
    }
    if (extractedPhotos.length === 0 && !videoUrlInput.trim()) {
      alert('Please add photos or enter a video URL to commit.');
      return;
    }

    const newWeddingImages: WeddingImage[] = extractedPhotos.map(p => ({
      id: p.id,
      url: p.url,
      alt: p.name,
      caption: p.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    }));

    if (newWeddingImages.length > 0) {
      await galleryStorage.addImagesToStory(selectedStoryId, newWeddingImages);
    }

    if (videoUrlInput.trim()) {
      await galleryStorage.setStoryVideo(selectedStoryId, videoUrlInput.trim(), videoPosterInput.trim() || undefined);
    }

    const targetStory = stories.find(s => s.id === selectedStoryId);
    setUploadSuccessMessage(
      `Successfully committed ${newWeddingImages.length} photographs ${videoUrlInput.trim() ? 'and wedding film' : ''} to ${targetStory?.title || 'collection'}!`
    );

    setExtractedPhotos([]);
    setVideoUrlInput('');
    setVideoPosterInput('');
    await refreshStories();
    triggerHaptic('success');
  };

  // Create New Couple Collection
  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupleName.trim() || !newCouplePin.trim()) {
      alert('Please provide couple names and a 4-digit client access PIN.');
      return;
    }

    const slug = newCoupleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newId = `story-custom-${Date.now()}`;

    const newStory: WeddingStory = {
      id: newId,
      slug: slug,
      title: newCoupleName.trim(),
      legacyUrl: `/portfolio/${slug}`,
      category: newCoupleCategory,
      tagline: newCoupleTagline.trim() || `Sacred celebration in ${newCoupleLocation || 'Kolkata'}`,
      coverImage: newCoupleCoverUrl.trim() || 'https://static.wixstatic.com/media/62230b_f07fcfaf32fb455db4a5b5fe38ec6738~mv2.jpg',
      heroImage: newCoupleCoverUrl.trim() || 'https://static.wixstatic.com/media/62230b_f07fcfaf32fb455db4a5b5fe38ec6738~mv2.jpg',
      isFeatured: false,
      videoUrl: newCoupleVideoUrl.trim() || undefined,
      videoPoster: newCoupleVideoUrl.trim() ? (newCoupleCoverUrl.trim() || undefined) : undefined,
      location: newCoupleLocation.trim() || undefined,
      date: newCoupleDate.trim() || undefined,
      imageCount: 0,
      images: []
    };

    await galleryStorage.saveStory(newStory, newCouplePin.trim());
    await refreshStories();

    setCoupleSuccessMessage(`Couple collection for "${newStory.title}" created with access PIN: ${newCouplePin}!`);
    setSelectedStoryId(newId);
    setNewCoupleName('');
    setNewCoupleTagline('');
    setNewCoupleLocation('');
    setNewCoupleDate('');
    setNewCouplePin('');
    setNewCoupleCoverUrl('');
    setNewCoupleCoverPreview('');
    setNewCoupleVideoUrl('');
    triggerHaptic('success');

    setTimeout(() => {
      setActiveTab('upload');
      setCoupleSuccessMessage('');
    }, 2000);
  };

  // Delete a specific photo from a story
  const handleDeletePhotoFromStory = async (storyId: string, photoId: string) => {
    if (window.confirm('Delete this photograph from the client collection?')) {
      await galleryStorage.removeImageFromStory(storyId, photoId);
      await refreshStories();
      triggerHaptic('light');
    }
  };

  // Save edits to couple PIN and Video
  const handleSaveStoryEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    await galleryStorage.updateStoryDetails(
      editingStory.id,
      {
        videoUrl: editVideoUrlInput.trim() || undefined,
        videoPoster: editVideoUrlInput.trim() ? editingStory.coverImage : undefined
      },
      editPinInput.trim() || undefined
    );

    await refreshStories();
    setIsEditStoryModalOpen(false);
    setEditingStory(null);
    triggerHaptic('success');
  };

  // Handle Cover File Upload for new couple
  const handleCoverFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const dataUrl = await fileToDataUrl(file);
    setNewCoupleCoverPreview(dataUrl);
    setNewCoupleCoverUrl(dataUrl);
    triggerHaptic('light');
  };

  // Delete Couple Story
  const handleDeleteStory = async (storyId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete custom collection "${title}"?`)) {
      await galleryStorage.deleteStory(storyId);
      await refreshStories();
      triggerHaptic('medium');
    }
  };

  // Export Backup JSON
  const handleExportBackup = async () => {
    const json = await galleryStorage.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YOU_AND_ME_Studio_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerHaptic('success');
  };

  // 1. Passcode Gate Screen
  if (!isAuthenticated) {
    return (
      <main className="admin-page auth-view" id="main-content">
        <div className="container">
          <div className="admin-auth-card">
            <div className="admin-auth-badge">
              <Lock size={26} className="gold-icon" />
            </div>

            <span className="admin-auth-eyebrow">Studio Management</span>
            <h1 className="admin-auth-title">YOU &amp; ME Studio Admin</h1>
            <p className="admin-auth-desc">
              Master control panel to upload client photos, bulk unpack ZIP archives, manage wedding films, and configure VIP client access PINs.
            </p>

            <form onSubmit={handleAuthSubmit} className="admin-auth-form">
              <div className="admin-auth-input-group">
                <input
                  type="password"
                  placeholder="Master Admin PIN (Demo: admin77)"
                  value={passcode}
                  onChange={e => {
                    setPasscode(e.target.value);
                    if (authError) setAuthError(false);
                  }}
                  className={`admin-input ${authError ? 'input-error' : ''}`}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  Enter Admin <ChevronRight size={16} />
                </button>
              </div>

              {authError && (
                <p className="admin-error-text">
                  Invalid master passcode. Default studio access PIN is: <strong>admin77</strong>
                </p>
              )}
            </form>

            {/* Review & Client Staging Credentials Card */}
            <div className="admin-credentials-card">
              <div className="admin-cred-header">
                <Key size={15} className="gold-icon" />
                <span>Admin Login Details for Revisions &amp; Review</span>
              </div>

              <div className="admin-cred-body">
                <div className="admin-cred-row">
                  <span className="cred-label">Master Passcode:</span>
                  <div className="cred-val-wrap">
                    <code className="cred-code">admin77</code>
                    <button
                      type="button"
                      className="cred-copy-btn"
                      onClick={handleCopyPasscode}
                      title="Copy passcode to clipboard"
                    >
                      {copiedPasscode ? <Check size={13} className="gold-icon" /> : <Copy size={13} />}
                      <span>{copiedPasscode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="admin-cred-row">
                  <span className="cred-label">Backup PIN:</span>
                  <code className="cred-code">admin2026</code>
                </div>

                <div className="admin-cred-row">
                  <span className="cred-label">Admin Scope:</span>
                  <span className="cred-val">Uploads • ZIP Decompressor • Video Links • PINs</span>
                </div>
              </div>

              {/* 1-Click Instant Login Button */}
              <button
                type="button"
                className="btn-quick-admin-login"
                onClick={handleQuickAdminLogin}
                title="1-Click immediate authentication for client staging"
              >
                <Sparkles size={15} className="gold-icon" />
                <span>Instant 1-Click Admin Access</span>
              </button>

              <p className="admin-cred-note">
                Use passcode <strong>admin77</strong> to review media uploads and make client revisions. Couples can access their private collection in <strong>/client-lounge</strong> with PIN <strong>2026</strong>.
              </p>
            </div>

            <button type="button" className="admin-back-btn" onClick={onBackToHome}>
              ← Return to Main Website
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 2. Main Admin Workspace
  const activeStory = stories.find(s => s.id === selectedStoryId);

  return (
    <main className="admin-page dashboard-view" id="main-content">
      {/* Admin Navigation Bar */}
      <header className="admin-navbar">
        <div className="container-wide admin-navbar-inner">
          <div className="admin-brand">
            <div className="admin-brand-tag">
              <Sparkles size={14} className="gold-icon" />
              <span>Studio Master Portal</span>
            </div>
            <h1 className="admin-panel-heading">Asset Engine &amp; Client Access Manager</h1>
          </div>

          <div className="admin-nav-actions">
            <button
              type="button"
              className="action-pill-btn"
              onClick={handleExportBackup}
              title="Download backup JSON of all custom collections and PINs"
            >
              <Download size={14} /> Backup Database (.JSON)
            </button>

            <button
              type="button"
              className="btn btn-outline admin-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={14} /> Exit Admin
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Header */}
      <div className="admin-tabs-section">
        <div className="container-wide">
          <div className="admin-tabs-bar">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('upload');
                triggerHaptic('light');
              }}
            >
              <Upload size={16} /> Upload &amp; ZIP Archive Importer
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('collections');
                triggerHaptic('light');
              }}
            >
              <Layers size={16} /> Client Collections ({stories.length})
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'new-couple' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('new-couple');
                triggerHaptic('light');
              }}
            >
              <Plus size={16} /> Create New Couple Suite
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('analytics');
                triggerHaptic('light');
              }}
            >
              <BarChart3 size={16} /> Activity &amp; Album Heatmaps
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: UPLOAD & ZIP IMPORTER */}
      {activeTab === 'upload' && (
        <section className="admin-tab-content">
          <div className="container-wide">
            <div className="admin-upload-grid">
              {/* Left Column: Dropzone & Settings */}
              <div className="upload-config-card">
                <h3 className="section-subtitle">1. Target Couple Collection</h3>
                <div className="form-group">
                  <label htmlFor="target-story">Select where assets should be assigned:</label>
                  <select
                    id="target-story"
                    value={selectedStoryId}
                    onChange={e => setSelectedStoryId(e.target.value)}
                    className="admin-select"
                  >
                    {stories.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.images.length} photos)
                      </option>
                    ))}
                  </select>
                </div>

                {activeStory && (
                  <div className="selected-story-summary">
                    <div className="summary-meta-grid">
                      <span>Active Collection: <strong>{activeStory.title}</strong></span>
                      <span>Category: <em>{activeStory.category}</em></span>
                      <span>Current Photos: <strong>{activeStory.images.length} frames</strong></span>
                      {activeStory.videoUrl ? (
                        <span className="gold-text"><Film size={12} /> Film Active</span>
                      ) : (
                        <span className="dim">No Film Attached</span>
                      )}
                    </div>
                    {activeStory.images.length > 0 && (
                      <button
                        type="button"
                        className="btn-manage-photos"
                        onClick={() => setIsManagePhotosModalOpen(true)}
                      >
                        <Eye size={14} /> Manage Assigned Photos ({activeStory.images.length})
                      </button>
                    )}
                  </div>
                )}

                <h3 className="section-subtitle" style={{ marginTop: 28 }}>2. Upload Photos or Zipped Folder</h3>
                
                {/* Drag and Drop Zone */}
                <div
                  className="admin-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => {
                    e.preventDefault();
                    e.currentTarget.classList.add('drag-active');
                  }}
                  onDragLeave={e => {
                    e.currentTarget.classList.remove('drag-active');
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('drag-active');
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                >
                  <input
                    type="file"
                    id={zipInputId}
                    ref={fileInputRef}
                    onChange={e => handleFilesSelected(e.target.files)}
                    accept=".zip,image/jpeg,image/png,image/webp,video/mp4"
                    multiple
                    style={{ display: 'none' }}
                  />
                  <div className="dropzone-icon">
                    <FolderArchive size={36} className="gold-icon" />
                  </div>
                  <h4>Drag &amp; Drop Zipped Folder or Photographs</h4>
                  <p>
                    Accepts <strong>.zip</strong> archives containing high-res wedding photos, or individual <strong>.jpg, .png, .webp</strong> files.
                  </p>
                  <button type="button" className="btn btn-outline dropzone-btn">
                    Browse Files or .ZIP
                  </button>
                </div>

                {/* Live ZIP Unpacking Progress */}
                {isProcessingZip && (
                  <div className="zip-progress-card">
                    <div className="zip-progress-header">
                      <span>Unpacking ZIP Archive directly in browser...</span>
                      <strong>{zipProgress}%</strong>
                    </div>
                    <div className="zip-progress-bar">
                      <div className="zip-progress-fill" style={{ width: `${zipProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Video Link Field */}
                <h3 className="section-subtitle" style={{ marginTop: 28 }}>3. Attach Cinematic Wedding Film (Optional)</h3>
                <div className="form-group">
                  <label htmlFor="video-url">Video MP4 URL or Vimeo/YouTube Embed:</label>
                  <input
                    id="video-url"
                    type="url"
                    placeholder="https://.../video.mp4 or YouTube / Vimeo link"
                    value={videoUrlInput}
                    onChange={e => setVideoUrlInput(e.target.value)}
                    className="admin-input-text"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="video-poster">Video Cover Poster URL (Optional):</label>
                  <input
                    id="video-poster"
                    type="url"
                    placeholder="https://.../poster.jpg"
                    value={videoPosterInput}
                    onChange={e => setVideoPosterInput(e.target.value)}
                    className="admin-input-text"
                  />
                </div>
              </div>

              {/* Right Column: Staged Queue & Commit */}
              <div className="upload-preview-card">
                <div className="queue-header">
                  <div>
                    <h3>Staged Asset Queue</h3>
                    <p>{extractedPhotos.length} photograph{extractedPhotos.length !== 1 ? 's' : ''} ready to commit</p>
                  </div>

                  {extractedPhotos.length > 0 && (
                    <button
                      type="button"
                      className="btn-clear-queue"
                      onClick={() => setExtractedPhotos([])}
                    >
                      Clear Queue
                    </button>
                  )}
                </div>

                {uploadSuccessMessage && (
                  <div className="admin-alert-success">
                    <div className="alert-content">
                      <CheckCircle2 size={18} />
                      <span>{uploadSuccessMessage}</span>
                    </div>
                    {selectedStoryId && (
                      <button
                        type="button"
                        className="alert-action-btn"
                        onClick={() => {
                          const pinEntry = Object.entries(pinsMap).find(([, sId]) => sId === selectedStoryId);
                          const pin = pinEntry ? pinEntry[0] : (selectedStoryId === 'story-1' ? '2026' : undefined);
                          if (onNavigateToClientLounge) {
                            onNavigateToClientLounge(pin);
                          } else {
                            window.open(pin ? `/client-lounge?pin=${pin}` : '/client-lounge', '_blank');
                          }
                        }}
                      >
                        View in Client Lounge <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Thumbnail Preview Grid */}
                <div className="queue-thumbnails-grid">
                  {extractedPhotos.map((photo) => (
                    <div key={photo.id} className="queue-thumb-card">
                      <img src={photo.url} alt={photo.name} />
                      <div className="queue-thumb-info">
                        <span className="queue-thumb-name">{photo.name}</span>
                        <span className="queue-thumb-size">{photo.size}</span>
                      </div>
                      <button
                        type="button"
                        className="queue-thumb-remove"
                        onClick={() => setExtractedPhotos(prev => prev.filter(p => p.id !== photo.id))}
                        title="Remove from queue"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {extractedPhotos.length === 0 && (
                    <div className="empty-queue-hint">
                      <FolderArchive size={40} className="dim" />
                      <p>Drop a <strong>.zip file</strong> or select photos on the left to queue them for upload.</p>
                    </div>
                  )}
                </div>

                {/* Commit Action */}
                <div className="commit-action-bar">
                  <button
                    type="button"
                    className="btn btn-primary btn-commit-all"
                    disabled={extractedPhotos.length === 0 && !videoUrlInput.trim()}
                    onClick={handleCommitPhotos}
                  >
                    <Upload size={16} /> Commit {extractedPhotos.length} Asset{extractedPhotos.length !== 1 ? 's' : ''} to Client Gallery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: CLIENT COLLECTIONS & PINS */}
      {activeTab === 'collections' && (
        <section className="admin-tab-content">
          <div className="container-wide">
            <div className="collections-table-card">
              <div className="collections-header">
                <div>
                  <h3>Active Client Suites</h3>
                  <p>Manage couple portals, review assigned PINs, and test client experience.</p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveTab('new-couple')}
                >
                  <Plus size={16} /> New Couple Suite
                </button>
              </div>

              <div className="collections-table-wrap">
                <table className="collections-table">
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Couple Title</th>
                      <th>Category</th>
                      <th>Client Access PIN</th>
                      <th>Photographs</th>
                      <th>Film</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stories.map(story => {
                      // Find PIN mapped to this story
                      const pinEntry = Object.entries(pinsMap).find(([, sId]) => sId === story.id);
                      const currentPin = pinEntry ? pinEntry[0] : (story.id === 'story-1' ? '2026' : '—');
                      const isCustom = story.id.startsWith('story-custom');

                      return (
                        <tr key={story.id}>
                          <td>
                            <img src={story.coverImage} alt={story.title} className="table-thumb" />
                          </td>
                          <td>
                            <strong>{story.title}</strong>
                            <span className="table-slug">/portfolio/{story.slug}</span>
                          </td>
                          <td>
                            <span className="category-pill">{story.category}</span>
                          </td>
                          <td>
                            <div className="pin-badge">
                              <Key size={13} className="gold-icon" />
                              <code>{currentPin}</code>
                            </div>
                          </td>
                          <td>
                            <strong>{story.images.length}</strong> frames
                          </td>
                          <td>
                            {story.videoUrl ? (
                              <span className="film-active-tag"><Film size={13} /> Active</span>
                            ) : (
                              <span className="dim">None</span>
                            )}
                          </td>
                          <td>
                            <div className="table-row-actions">
                              <button
                                type="button"
                                className="action-btn-sm action-btn-add"
                                title="Upload Photos / Video to this Collection"
                                onClick={() => {
                                  setSelectedStoryId(story.id);
                                  setActiveTab('upload');
                                  triggerHaptic('light');
                                }}
                              >
                                <Upload size={13} /> Add Media
                              </button>

                              <button
                                type="button"
                                className="action-btn-sm"
                                title="Edit Client PIN & Wedding Film"
                                onClick={() => {
                                  setEditingStory(story);
                                  setEditPinInput(currentPin !== '—' ? currentPin : '');
                                  setEditVideoUrlInput(story.videoUrl || '');
                                  setIsEditStoryModalOpen(true);
                                  triggerHaptic('light');
                                }}
                              >
                                <Edit3 size={13} /> Edit PIN / Film
                              </button>

                              {story.images.length > 0 && (
                                <button
                                  type="button"
                                  className="action-btn-sm"
                                  title="Manage Assigned Photos"
                                  onClick={() => {
                                    setSelectedStoryId(story.id);
                                    setIsManagePhotosModalOpen(true);
                                    triggerHaptic('light');
                                  }}
                                >
                                  <Eye size={13} /> Photos ({story.images.length})
                                </button>
                              )}

                              <button
                                type="button"
                                className="action-btn-sm"
                                title="Open in Client Lounge"
                                onClick={() => {
                                  if (onNavigateToClientLounge) {
                                    onNavigateToClientLounge(currentPin !== '—' ? currentPin : undefined);
                                  } else {
                                    window.open(currentPin !== '—' ? `/client-lounge?pin=${currentPin}` : '/client-lounge', '_blank');
                                  }
                                }}
                              >
                                <ExternalLink size={13} /> Portal
                              </button>

                              {isCustom && (
                                <button
                                  type="button"
                                  className="action-btn-danger"
                                  title="Delete custom collection"
                                  onClick={() => handleDeleteStory(story.id, story.title)}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: CREATE NEW COUPLE */}
      {activeTab === 'new-couple' && (
        <section className="admin-tab-content">
          <div className="container-wide">
            <div className="new-couple-card">
              <div className="new-couple-header">
                <h3>Provision New Wedding Client Suite</h3>
                <p>Configure a private portal and unique access PIN for your bride &amp; groom.</p>
              </div>

              {coupleSuccessMessage && (
                <div className="admin-alert-success">
                  <CheckCircle2 size={18} />
                  <span>{coupleSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleCreateCouple} className="new-couple-form">
                <div className="form-row two-cols">
                  <div className="form-group">
                    <label htmlFor="couple-names">Couple Names *</label>
                    <input
                      id="couple-names"
                      type="text"
                      required
                      placeholder="e.g. Rohan & Prianka"
                      value={newCoupleName}
                      onChange={e => setNewCoupleName(e.target.value)}
                      className="admin-input-text"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="client-pin">Client Access PIN (4-Digits) *</label>
                    <input
                      id="client-pin"
                      type="text"
                      required
                      placeholder="e.g. 4455"
                      value={newCouplePin}
                      onChange={e => setNewCouplePin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="admin-input-text"
                    />
                  </div>
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label htmlFor="category">Ceremony Style / Category</label>
                    <select
                      id="category"
                      value={newCoupleCategory}
                      onChange={e => setNewCoupleCategory(e.target.value)}
                      className="admin-select"
                    >
                      <option value="Bengali Wedding">Bengali Wedding</option>
                      <option value="Destination Wedding">Destination Wedding</option>
                      <option value="Heritage Couple">Heritage Couple</option>
                      <option value="Traditional Mandap">Traditional Mandap</option>
                      <option value="Intimate Wedding">Intimate Wedding</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="wedding-date">Wedding Date</label>
                    <input
                      id="wedding-date"
                      type="date"
                      value={newCoupleDate}
                      onChange={e => setNewCoupleDate(e.target.value)}
                      className="admin-input-text"
                    />
                  </div>
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label htmlFor="location">Venue / Location</label>
                    <input
                      id="location"
                      type="text"
                      placeholder="e.g. The Rajbari Bawali, Kolkata"
                      value={newCoupleLocation}
                      onChange={e => setNewCoupleLocation(e.target.value)}
                      className="admin-input-text"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cover-url">Cover Photo (URL or File Upload)</label>
                    <div className="cover-upload-flex">
                      <input
                        id="cover-url"
                        type="url"
                        placeholder="https://.../cover.jpg (or upload file)"
                        value={newCoupleCoverUrl}
                        onChange={e => {
                          setNewCoupleCoverUrl(e.target.value);
                          setNewCoupleCoverPreview(e.target.value);
                        }}
                        className="admin-input-text"
                      />
                      <input
                        type="file"
                        ref={coverFileInputRef}
                        accept="image/*"
                        onChange={e => handleCoverFileChange(e.target.files)}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-upload-cover"
                        onClick={() => coverFileInputRef.current?.click()}
                      >
                        <Upload size={14} /> File
                      </button>
                    </div>
                    {newCoupleCoverPreview && (
                      <div className="cover-preview-badge">
                        <img src={newCoupleCoverPreview} alt="Cover Preview" />
                        <span>Cover Photo Selected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label htmlFor="new-couple-video">Wedding Film / Teaser URL (Optional)</label>
                    <input
                      id="new-couple-video"
                      type="url"
                      placeholder="https://.../video.mp4 or YouTube / Vimeo link"
                      value={newCoupleVideoUrl}
                      onChange={e => setNewCoupleVideoUrl(e.target.value)}
                      className="admin-input-text"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tagline">Editorial Story Tagline</label>
                    <input
                      id="tagline"
                      type="text"
                      placeholder="e.g. A symphony of sacred turmeric, heirloom Banarasis, and twilight vows"
                      value={newCoupleTagline}
                      onChange={e => setNewCoupleTagline(e.target.value)}
                      className="admin-input-text"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary btn-save-couple">
                    <Sparkles size={16} /> Create Couple Portal &amp; Authorize PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: CLIENT ACTIVITY & ALBUM HEATMAPS */}
      {activeTab === 'analytics' && (
        <section className="admin-tab-content">
          <div className="container-wide">
            {/* Header Banner */}
            <div className="analytics-header-card">
              <div className="analytics-header-title">
                <div className="admin-brand-tag">
                  <Flame size={14} className="gold-icon" />
                  <span>Real-Time Engagement Telemetry</span>
                </div>
                <h2>Client Curation &amp; Photo Popularity Heatmaps</h2>
                <p>
                  Monitor which archival moments resonate most deeply with couples and their families, track lay-flat physical album bindery progress, and generate multi-tier access invitations.
                </p>
              </div>
            </div>

            {/* Grid Row: Proofing Progress & Multi-Tier PIN Manager */}
            <div className="analytics-split-grid">
              {/* Left Column: Proofing Progress */}
              <div className="analytics-card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <BookOpen size={18} className="gold-icon" />
                    <h3>Heirloom Proofing Completion Status</h3>
                  </div>
                  <span className="card-badge">Target: 80 Frames</span>
                </div>

                <div className="proofing-progress-list">
                  {stories.map(story => {
                    let curatedCount = 0;
                    try {
                      const saved = localStorage.getItem(`youandme_album_selection_${story.id}`);
                      if (saved) curatedCount = JSON.parse(saved).length;
                      else curatedCount = Math.min(14, story.images.length);
                    } catch {
                      curatedCount = 14;
                    }
                    const percent = Math.min(100, Math.round((curatedCount / 80) * 100));
                    const isReady = curatedCount >= 80;

                    return (
                      <div key={story.id} className="proofing-item-card">
                        <div className="proofing-item-header">
                          <span className="proofing-couple-name">{story.title}</span>
                          <span className={`proofing-status-badge ${isReady ? 'ready' : 'in-progress'}`}>
                            {isReady ? 'Ready for Bindery' : `${curatedCount} / 80 Curated (${percent}%)`}
                          </span>
                        </div>
                        <div className="proofing-progress-rail">
                          <div
                            className={`proofing-progress-bar ${isReady ? 'is-complete' : ''}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Multi-Tier Sub-PIN Distribution & WhatsApp Dispatch */}
              <div className="analytics-card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <Users size={18} className="gold-icon" />
                    <h3>Multi-Tier Sub-PIN Access &amp; Dispatch</h3>
                  </div>
                  <span className="card-badge">Couple • Family • Guest</span>
                </div>

                <div className="subpin-cards-list">
                  {stories.map(story => {
                    const pins = subPinsMap[story.id] || { couplePin: '2026', familyPin: '2027', guestPin: '2028' };
                    const isInviteCopied = copiedInviteId === story.id;

                    return (
                      <div key={story.id} className="subpin-couple-box">
                        <div className="subpin-box-top">
                          <h4 className="subpin-couple-title">{story.title}</h4>
                          <button
                            type="button"
                            className={`btn-copy-invite ${isInviteCopied ? 'copied' : ''}`}
                            onClick={() => handleCopyWhatsAppInvite(story, pins)}
                            title="Copy ready-to-dispatch WhatsApp invitation message"
                          >
                            {isInviteCopied ? (
                              <><Check size={13} /> Copied WhatsApp Invite</>
                            ) : (
                              <><Share2 size={13} /> Copy WhatsApp Invitation</>
                            )}
                          </button>
                        </div>

                        <div className="subpin-pills-row">
                          {/* Couple Master PIN */}
                          <div
                            className="subpin-pill couple-pill"
                            onClick={() => handleCopyPin(pins.couplePin, `${story.id}-couple`)}
                            title="Click to copy Master Couple PIN"
                          >
                            <span className="pin-role">Master PIN</span>
                            <span className="pin-code">{pins.couplePin}</span>
                            {copiedPinKey === `${story.id}-couple` ? <Check size={12} /> : <Copy size={12} />}
                          </div>

                          {/* Family PIN */}
                          <div
                            className="subpin-pill family-pill"
                            onClick={() => handleCopyPin(pins.familyPin, `${story.id}-family`)}
                            title="Click to copy Family Sanctuary PIN"
                          >
                            <span className="pin-role">Family PIN</span>
                            <span className="pin-code">{pins.familyPin}</span>
                            {copiedPinKey === `${story.id}-family` ? <Check size={12} /> : <Copy size={12} />}
                          </div>

                          {/* Guest PIN */}
                          <div
                            className="subpin-pill guest-pill"
                            onClick={() => handleCopyPin(pins.guestPin, `${story.id}-guest`)}
                            title="Click to copy Guest PIN"
                          >
                            <span className="pin-role">Guest PIN</span>
                            <span className="pin-code">{pins.guestPin}</span>
                            {copiedPinKey === `${story.id}-guest` ? <Check size={12} /> : <Copy size={12} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Row: Top Hearted Moments Heatmap Leaderboard */}
            <div className="analytics-card heatmap-leaderboard-card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <Flame size={18} className="crimson-icon" />
                  <h3>Archival Moment Heatmap &amp; Favorites Leaderboard</h3>
                </div>
                <span className="card-badge">Most Curated Across Collections</span>
              </div>

              <div className="heatmap-photos-grid">
                {galleryStorage.getTopHeartedPhotos(stories, 6).map((item, idx) => (
                  <div key={item.photo.id} className="heatmap-photo-card">
                    <div className="heatmap-img-wrap">
                      <img src={item.photo.url} alt={item.photo.alt} className="heatmap-img" />
                      <div className="heatmap-rank-badge">#{idx + 1}</div>
                      <div className="heatmap-count-badge">
                        <Heart size={12} fill="#E5253A" color="#E5253A" />
                        <span>{item.count} hearts</span>
                      </div>
                    </div>
                    <div className="heatmap-info">
                      <span className="heatmap-couple">{item.storyTitle}</span>
                      <span className="heatmap-caption">{item.photo.caption || `Frame ${item.photo.id}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MODAL 1: MANAGE ASSIGNED PHOTOS FOR ACTIVE STORY */}
      {isManagePhotosModalOpen && activeStory && (
        <div className="admin-modal-overlay" onClick={() => setIsManagePhotosModalOpen(false)}>
          <div className="admin-modal-card modal-large" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Assigned Photographs</h3>
                <p>
                  Collection: <strong>{activeStory.title}</strong> — {activeStory.images.length} frame{activeStory.images.length !== 1 ? 's' : ''} assigned
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsManagePhotosModalOpen(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {activeStory.images.length === 0 ? (
                <div className="modal-empty-state">
                  <FolderArchive size={44} className="dim" />
                  <h4>No Photographs Assigned Yet</h4>
                  <p>Upload a .zip folder or individual photos in Tab 1 to assign frames to this client suite.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setIsManagePhotosModalOpen(false);
                      setActiveTab('upload');
                    }}
                  >
                    <Upload size={14} /> Go to Upload Tab
                  </button>
                </div>
              ) : (
                <div className="assigned-photos-grid">
                  {activeStory.images.map((img, idx) => (
                    <div key={img.id || idx} className="assigned-photo-card">
                      <div className="assigned-photo-thumb">
                        <img src={img.url} alt={img.alt || activeStory.title} loading="lazy" />
                        <span className="photo-index-tag">#{idx + 1}</span>
                      </div>
                      <div className="assigned-photo-footer">
                        <span className="assigned-photo-caption" title={img.caption || img.alt || `Photo ${idx + 1}`}>
                          {img.caption || img.alt || `Photo ${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          className="btn-delete-photo"
                          title="Remove this photo from client collection"
                          onClick={() => handleDeletePhotoFromStory(activeStory.id, img.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <span className="modal-count-summary">
                Total: <strong>{activeStory.images.length}</strong> photo{activeStory.images.length !== 1 ? 's' : ''}
              </span>
              <div className="modal-actions-right">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setIsManagePhotosModalOpen(false);
                    setActiveTab('upload');
                  }}
                >
                  <Upload size={14} /> Add More Photos
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsManagePhotosModalOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CLIENT PIN & FILM */}
      {isEditStoryModalOpen && editingStory && (
        <div className="admin-modal-overlay" onClick={() => setIsEditStoryModalOpen(false)}>
          <div className="admin-modal-card modal-small" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Edit Client Access &amp; Film</h3>
                <p>Suite: <strong>{editingStory.title}</strong></p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditStoryModalOpen(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStoryEdit} className="admin-modal-form">
              <div className="admin-modal-body">
                <div className="form-group">
                  <label htmlFor="edit-pin">Client Access PIN (4-6 digits)</label>
                  <input
                    id="edit-pin"
                    type="text"
                    placeholder="e.g. 2026"
                    value={editPinInput}
                    onChange={e => setEditPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="admin-input-text"
                  />
                  <small className="form-hint">Client uses this PIN to unlock their private portal.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-video">Wedding Film URL (MP4, YouTube, or Vimeo)</label>
                  <input
                    id="edit-video"
                    type="url"
                    placeholder="https://.../video.mp4 or YouTube / Vimeo link"
                    value={editVideoUrlInput}
                    onChange={e => setEditVideoUrlInput(e.target.value)}
                    className="admin-input-text"
                  />
                  <small className="form-hint">Leave blank to remove film from this client collection.</small>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsEditStoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
