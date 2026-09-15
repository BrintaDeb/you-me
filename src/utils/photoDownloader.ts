/**
 * Robust utility for downloading individual high-resolution photographs
 * Handles cross-origin URLs, blobs, data-URLs, canvas rendering, and direct downloads
 */
export async function downloadPhotoFile(url: string, filename: string): Promise<boolean> {
  if (!url) return false;

  const cleanFilename = filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.webp')
    ? filename
    : `${filename}.jpg`;

  // 1. Direct download if already a blob URL or base64 data URL
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  // 2. Try fetching as Blob (handles CORS-enabled CDNs and same-origin URLs)
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit'
    });

    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return true;
    }
  } catch (err) {
    console.warn('Fetch download failed, attempting canvas conversion:', err);
  }

  // 3. Fallback: Draw to HTML5 Canvas with anonymous CORS
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = cleanFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }
  } catch (canvasErr) {
    console.warn('Canvas conversion failed, attempting direct link trigger:', canvasErr);
  }

  // 4. Final fallback: Trigger native anchor download / open in new tab
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanFilename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch {
    window.open(url, '_blank');
    return false;
  }
}
