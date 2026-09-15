import { couplesData } from '../data/couplesData';
import type { WeddingStory, WeddingImage } from '../data/couplesData';

export interface StoredStoryMeta {
  id: string;
  pin: string;
  isPrivate: boolean;
  uploadedAt: string;
}

export type ClientRole = 'couple' | 'family' | 'guest';

export interface PinRecord {
  pin: string;
  storyId: string;
  role: ClientRole;
}

const DB_NAME = 'YouAndMeStudioDB';
const DB_VERSION = 1;
const STORE_STORIES = 'stories';
const STORE_PINS = 'pins';

const DEFAULT_PIN_RECORDS: PinRecord[] = [
  // Paraj & Mrinmoyee
  { pin: '2026', storyId: couplesData[0].id, role: 'couple' },
  { pin: '2027', storyId: couplesData[0].id, role: 'family' },
  { pin: '2028', storyId: couplesData[0].id, role: 'guest' },
  // Jasraj & Urmi
  { pin: '1122', storyId: couplesData[1]?.id || couplesData[0].id, role: 'couple' },
  { pin: '1123', storyId: couplesData[1]?.id || couplesData[0].id, role: 'family' },
  { pin: '1124', storyId: couplesData[1]?.id || couplesData[0].id, role: 'guest' },
  // Avik & Binita
  { pin: '3344', storyId: couplesData[2]?.id || couplesData[0].id, role: 'couple' },
  { pin: '3345', storyId: couplesData[2]?.id || couplesData[0].id, role: 'family' },
  { pin: '3346', storyId: couplesData[2]?.id || couplesData[0].id, role: 'guest' }
];

class GalleryStorageManager {
  private dbPromise: Promise<IDBDatabase | null>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_STORIES)) {
            db.createObjectStore(STORE_STORIES, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_PINS)) {
            db.createObjectStore(STORE_PINS, { keyPath: 'pin' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('IndexedDB failed to open, fallback to localStorage');
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  }

  // Get all custom stories from IndexedDB
  public async getCustomStories(): Promise<WeddingStory[]> {
    const db = await this.dbPromise;
    if (!db) {
      try {
        const fallback = localStorage.getItem('youandme_custom_stories');
        return fallback ? JSON.parse(fallback) : [];
      } catch {
        return [];
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_STORIES, 'readonly');
        const store = tx.objectStore(STORE_STORIES);
        const req = store.getAll();

        req.onsuccess = () => {
          resolve(req.result || []);
        };
        req.onerror = () => {
          resolve([]);
        };
      } catch {
        resolve([]);
      }
    });
  }

  // Save or update an entire story in IndexedDB & localStorage fallback
  public async saveStory(story: WeddingStory, pin?: string): Promise<boolean> {
    const db = await this.dbPromise;

    if (!db) {
      try {
        const existing = await this.getCustomStories();
        const filtered = existing.filter(s => s.id !== story.id);
        localStorage.setItem('youandme_custom_stories', JSON.stringify([...filtered, story]));
      } catch {
        return false;
      }
    } else {
      await new Promise<boolean>((resolve) => {
        try {
          const tx = db.transaction(STORE_STORIES, 'readwrite');
          const store = tx.objectStore(STORE_STORIES);
          store.put(story);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      });
    }

    if (pin && pin.trim()) {
      await this.savePinWithRole(pin.trim(), story.id, 'couple');
    }

    return true;
  }

  // Get all raw PIN records (with role)
  public async getAllPinRecords(): Promise<PinRecord[]> {
    const db = await this.dbPromise;
    if (!db) {
      try {
        const fallback = localStorage.getItem('youandme_custom_pin_records');
        if (fallback) {
          const parsed: PinRecord[] = JSON.parse(fallback);
          const map = new Map<string, PinRecord>();
          DEFAULT_PIN_RECORDS.forEach(p => map.set(p.pin, p));
          parsed.forEach(p => map.set(p.pin, p));
          return Array.from(map.values());
        }
        return DEFAULT_PIN_RECORDS;
      } catch {
        return DEFAULT_PIN_RECORDS;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PINS, 'readonly');
        const store = tx.objectStore(STORE_PINS);
        const req = store.getAll();

        req.onsuccess = () => {
          const map = new Map<string, PinRecord>();
          DEFAULT_PIN_RECORDS.forEach(p => map.set(p.pin, p));
          const results: PinRecord[] = req.result || [];
          results.forEach(p => {
            map.set(p.pin, {
              pin: p.pin,
              storyId: p.storyId,
              role: p.role || 'couple'
            });
          });
          resolve(Array.from(map.values()));
        };
        req.onerror = () => {
          resolve(DEFAULT_PIN_RECORDS);
        };
      } catch {
        resolve(DEFAULT_PIN_RECORDS);
      }
    });
  }

  // Legacy compatibility: Get all PIN mappings as { pin: storyId }
  public async getAllPins(): Promise<Record<string, string>> {
    const records = await this.getAllPinRecords();
    const map: Record<string, string> = {};
    for (const item of records) {
      map[item.pin] = item.storyId;
    }
    return map;
  }

  // Get sub-pins for a specific story
  public async getSubPinsForStory(storyId: string): Promise<{ couplePin: string; familyPin: string; guestPin: string }> {
    const records = await this.getAllPinRecords();
    const storyPins = records.filter(p => p.storyId === storyId);

    const couple = storyPins.find(p => p.role === 'couple')?.pin;
    const family = storyPins.find(p => p.role === 'family')?.pin;
    const guest = storyPins.find(p => p.role === 'guest')?.pin;

    // Deterministic fallbacks if not explicitly set
    const fallbackBase = storyId.length >= 4 ? storyId.slice(0, 4) : '2026';
    const numBase = parseInt(fallbackBase.replace(/\D/g, '') || '2026', 10);

    return {
      couplePin: couple || String(numBase),
      familyPin: family || String(numBase + 1),
      guestPin: guest || String(numBase + 2)
    };
  }

  // Save all 3 sub-PINs for a story
  public async saveSubPins(
    storyId: string,
    couplePin: string,
    familyPin: string,
    guestPin: string
  ): Promise<boolean> {
    const records: PinRecord[] = [
      { pin: couplePin.trim(), storyId, role: 'couple' },
      { pin: familyPin.trim(), storyId, role: 'family' },
      { pin: guestPin.trim(), storyId, role: 'guest' }
    ];

    for (const r of records) {
      if (r.pin) {
        await this.savePinWithRole(r.pin, r.storyId, r.role);
      }
    }
    return true;
  }

  // Save a single PIN with role
  public async savePinWithRole(pin: string, storyId: string, role: ClientRole = 'couple'): Promise<boolean> {
    const record: PinRecord = { pin, storyId, role };
    const db = await this.dbPromise;

    try {
      const records = await this.getAllPinRecords();
      const filtered = records.filter(r => r.pin !== pin);
      localStorage.setItem('youandme_custom_pin_records', JSON.stringify([...filtered, record]));
    } catch {}

    if (!db) {
      try {
        const map = await this.getAllPins();
        map[pin] = storyId;
        localStorage.setItem('youandme_custom_pins', JSON.stringify(map));
        return true;
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PINS, 'readwrite');
        const store = tx.objectStore(STORE_PINS);
        store.put(record);

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  // Save PIN mapping (legacy alias)
  public async savePin(pin: string, storyId: string, role: ClientRole = 'couple'): Promise<boolean> {
    return this.savePinWithRole(pin, storyId, role);
  }

  // Get unified list of all couple stories (default + admin custom)
  public async getUnifiedStories(): Promise<WeddingStory[]> {
    const customStories = await this.getCustomStories();
    const customMap = new Map(customStories.map(s => [s.id, s]));

    const merged = couplesData.map(story => {
      if (customMap.has(story.id)) {
        const custom = customMap.get(story.id)!;
        customMap.delete(story.id);
        return custom;
      }
      return story;
    });

    return [...customMap.values(), ...merged];
  }

  // Resolve story AND role by entered PIN
  public async resolvePin(pin: string): Promise<{ story: WeddingStory; role: ClientRole } | null> {
    const records = await this.getAllPinRecords();
    const clean = pin.trim();
    const match = records.find(r => r.pin === clean);

    const all = await this.getUnifiedStories();

    if (match) {
      const story = all.find(s => s.id === match.storyId) || couplesData[0];
      return { story, role: match.role };
    }

    // Default demo fallback: 2026 -> couple, 2027 -> family, 2028 -> guest
    if (clean === '2026') return { story: couplesData[0], role: 'couple' };
    if (clean === '2027') return { story: couplesData[0], role: 'family' };
    if (clean === '2028') return { story: couplesData[0], role: 'guest' };

    return null;
  }

  // Find story by client access PIN (legacy method)
  public async getStoryByPin(pin: string): Promise<WeddingStory | null> {
    const resolved = await this.resolvePin(pin);
    return resolved ? resolved.story : null;
  }

  // Heart Analytics Methods
  public getHeartCounts(): Record<string, number> {
    try {
      const saved = localStorage.getItem('youandme_photo_hearts_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  public recordPhotoHeart(photoId: string, isHearted: boolean): void {
    try {
      const map = this.getHeartCounts();
      const current = map[photoId] || 0;
      if (isHearted) {
        map[photoId] = current + 1;
      } else {
        map[photoId] = Math.max(0, current - 1);
      }
      localStorage.setItem('youandme_photo_hearts_map', JSON.stringify(map));
    } catch {}
  }

  public getTopHeartedPhotos(allStories: WeddingStory[], limit = 6): { photo: WeddingImage; count: number; storyTitle: string }[] {
    const map = this.getHeartCounts();
    const list: { photo: WeddingImage; count: number; storyTitle: string }[] = [];

    allStories.forEach(story => {
      // Check if user has album curation saved for this story
      let curatedIds: string[] = [];
      try {
        const saved = localStorage.getItem(`youandme_album_selection_${story.id}`);
        if (saved) curatedIds = JSON.parse(saved);
      } catch {}

      story.images.forEach((img, idx) => {
        let count = map[img.id] || 0;
        // If it was in the couple's curation or initial demo, give baseline weight
        if (curatedIds.includes(img.id)) count += 3;
        else if (idx < 5) count += 2;

        if (count > 0) {
          list.push({ photo: img, count, storyTitle: story.title });
        }
      });
    });

    list.sort((a, b) => b.count - a.count);
    return list.slice(0, limit);
  }

  // Add batch images to an existing story
  public async addImagesToStory(storyId: string, newImages: WeddingImage[]): Promise<WeddingStory | null> {
    const all = await this.getUnifiedStories();
    const target = all.find(s => s.id === storyId);
    if (!target) return null;

    const updatedStory: WeddingStory = {
      ...target,
      imageCount: target.images.length + newImages.length,
      images: [...newImages, ...target.images]
    };

    await this.saveStory(updatedStory);
    return updatedStory;
  }

  // Set video for story
  public async setStoryVideo(storyId: string, videoUrl: string, posterUrl?: string): Promise<WeddingStory | null> {
    const all = await this.getUnifiedStories();
    const target = all.find(s => s.id === storyId);
    if (!target) return null;

    const updatedStory: WeddingStory = {
      ...target,
      videoUrl: videoUrl.trim(),
      videoPoster: posterUrl ? posterUrl.trim() : target.coverImage
    };

    await this.saveStory(updatedStory);
    return updatedStory;
  }

  // Remove an individual image from a story
  public async removeImageFromStory(storyId: string, imageId: string): Promise<WeddingStory | null> {
    const all = await this.getUnifiedStories();
    const target = all.find(s => s.id === storyId);
    if (!target) return null;

    const filteredImages = target.images.filter(img => img.id !== imageId);
    const updatedStory: WeddingStory = {
      ...target,
      imageCount: filteredImages.length,
      images: filteredImages
    };

    await this.saveStory(updatedStory);
    return updatedStory;
  }

  // Update story details & optionally its PIN
  public async updateStoryDetails(storyId: string, updates: Partial<WeddingStory>, newPin?: string): Promise<WeddingStory | null> {
    const all = await this.getUnifiedStories();
    const target = all.find(s => s.id === storyId);
    if (!target) return null;

    const updatedStory: WeddingStory = {
      ...target,
      ...updates
    };

    await this.saveStory(updatedStory, newPin);
    return updatedStory;
  }

  // Delete custom story
  public async deleteStory(storyId: string): Promise<boolean> {
    const db = await this.dbPromise;
    if (!db) {
      try {
        const existing = await this.getCustomStories();
        localStorage.setItem('youandme_custom_stories', JSON.stringify(existing.filter(s => s.id !== storyId)));
        return true;
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_STORIES, STORE_PINS], 'readwrite');
        const storyStore = tx.objectStore(STORE_STORIES);
        storyStore.delete(storyId);

        // Delete any pin mapped to this story
        const pinStore = tx.objectStore(STORE_PINS);
        const req = pinStore.getAll();
        req.onsuccess = () => {
          const items = req.result || [];
          for (const item of items) {
            if (item.storyId === storyId) {
              pinStore.delete(item.pin);
            }
          }
        };

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  // Export full JSON backup
  public async exportBackup(): Promise<string> {
    const custom = await this.getCustomStories();
    const pins = await this.getAllPins();
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      customStories: custom,
      pins: pins
    }, null, 2);
  }
}

export const galleryStorage = new GalleryStorageManager();
