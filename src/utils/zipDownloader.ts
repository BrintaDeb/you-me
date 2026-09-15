import JSZip from 'jszip';

interface BatchDownloadItem {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
}

export interface BatchZipProgress {
  percent: number;
  message: string;
  currentCount?: number;
  totalCount?: number;
}

/**
 * Robust image-to-blob fetcher with canvas fallback for cross-origin assets
 */
async function fetchImageBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url, { mode: 'cors', cache: 'force-cache' });
    if (response.ok) {
      return await response.blob();
    }
  } catch {
    // Network or CORS fetch failed, attempt HTMLImageElement canvas extraction
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 1920;
          canvas.height = img.naturalHeight || img.height || 1080;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.95
          );
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Downloads a batch of wedding images packaged into a single ZIP archive client-side
 */
export async function downloadBatchAsZip(
  items: BatchDownloadItem[],
  storyTitle: string,
  onProgress?: (progress: BatchZipProgress) => void
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!items || items.length === 0) {
    return { success: false, count: 0, error: 'No photographs selected for batch download' };
  }

  const cleanTitle = storyTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const zip = new JSZip();
  const folderName = `YOU_AND_ME_${cleanTitle}_Selected_Photos`;
  const folder = zip.folder(folderName) || zip;

  onProgress?.({
    percent: 5,
    message: 'Initializing archival packaging engine...',
    currentCount: 0,
    totalCount: items.length
  });

  let completedCount = 0;
  const manifestItems: Array<{ index: number; id: string; filename: string; caption?: string }> = [];

  // Process images with batch concurrency of 3
  const CONCURRENCY = 3;
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);

    await Promise.all(
      chunk.map(async (item, chunkIndex) => {
        const itemIdx = i + chunkIndex;
        const paddedIndex = String(itemIdx + 1).padStart(2, '0');
        const filename = `${paddedIndex}_Frame_${item.id}.jpg`;

        onProgress?.({
          percent: Math.min(80, Math.round(10 + (itemIdx / items.length) * 70)),
          message: `Archiving photo ${itemIdx + 1} of ${items.length}...`,
          currentCount: itemIdx + 1,
          totalCount: items.length
        });

        const blob = await fetchImageBlob(item.url);
        if (blob) {
          folder.file(filename, blob);
          manifestItems.push({
            index: itemIdx + 1,
            id: item.id,
            filename,
            caption: item.caption
          });
          completedCount++;
        }
      })
    );
  }

  if (completedCount === 0) {
    return { success: false, count: 0, error: 'Could not fetch image assets for ZIP compression.' };
  }

  // Add Manifest JSON
  const manifest = {
    studio: 'YOU & ME Wedding Photography',
    curation: `${storyTitle} — Curated Wedding Frames`,
    exportDate: new Date().toISOString(),
    totalArchived: completedCount,
    files: manifestItems
  };
  folder.file('selection_manifest.json', JSON.stringify(manifest, null, 2));

  // Add README
  const readme = `=====================================================
YOU & ME — LUXURY WEDDING PHOTOGRAPHY & CINEMATOGRAPHY
Archival Client Vault Selection
=====================================================

Couple: ${storyTitle}
Date of Export: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
Frames Included: ${completedCount}

PRINT & ARCHIVAL CARE INSTRUCTIONS:
1. These master photographs are preserved in full color fidelity.
2. For heirloom albums and fine-art wall frames, we recommend 
   printing on museum-grade cotton rag or Fuji Crystal Archive paper.
3. For digital social sharing, portrait aspect ratios (4:5 or 9:16)
   are recommended.

Direct Inquiries & Print Lab Orders:
WhatsApp: +91 91238 27488
Email: youandmestudio.wedding@gmail.com
`;
  folder.file('README.txt', readme);

  // Generate ZIP
  onProgress?.({
    percent: 85,
    message: 'Compressing archival ZIP container...',
    currentCount: completedCount,
    totalCount: items.length
  });

  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      onProgress?.({
        percent: Math.min(98, Math.round(85 + (metadata.percent / 100) * 13)),
        message: `Compressing package: ${Math.round(metadata.percent)}%`,
        currentCount: completedCount,
        totalCount: items.length
      });
    }
  );

  onProgress?.({
    percent: 100,
    message: 'Package ready! Triggering download...',
    currentCount: completedCount,
    totalCount: items.length
  });

  // Trigger browser download
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  return { success: true, count: completedCount };
}
