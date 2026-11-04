import { useEffect, useMemo, useState } from 'react';

export const ICON_PICKER_RASTER_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;
export type IconPickerRasterMimeType = (typeof ICON_PICKER_RASTER_TYPES)[number];

function matchesRasterHeader(type: string, bytes: Uint8Array): boolean {
  switch (type) {
    case 'image/png':
      return [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
    case 'image/jpeg':
      return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    case 'image/gif':
      return (
        String.fromCharCode(...bytes.subarray(0, 6)) === 'GIF87a' ||
        String.fromCharCode(...bytes.subarray(0, 6)) === 'GIF89a'
      );
    case 'image/webp':
      return (
        String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' &&
        String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP'
      );
    default:
      return false;
  }
}

/** Reject network URLs, SVG, and raster MIME labels containing non-raster payloads. */
export function safeRasterDataSource(src: string): string | undefined {
  const match = /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]+={0,2})$/i.exec(src);
  const type = match?.[1];
  const payload = match?.[2];
  if (!type || !payload || payload.length % 4 !== 0) return undefined;
  try {
    const header = atob(payload.slice(0, 32));
    const bytes = Uint8Array.from(header, (character) => character.charCodeAt(0));
    return matchesRasterHeader(type.toLowerCase(), bytes) ? src : undefined;
  } catch {
    return undefined;
  }
}

export function isLocalBlobSource(src: string): boolean {
  if (typeof window === 'undefined' || !src.startsWith('blob:')) return false;
  try {
    const url = new URL(src);
    return url.protocol === 'blob:' && url.origin === window.location.origin;
  } catch {
    return false;
  }
}

/** Blob URLs are resolved locally, then checked before an image element receives them. */
export function useSafeRasterSource(src: string): string | undefined {
  const [verifiedBlob, setVerifiedBlob] = useState<string>();
  const dataSource = useMemo(() => safeRasterDataSource(src), [src]);

  useEffect(() => {
    if (dataSource || !isLocalBlobSource(src)) return;
    const controller = new AbortController();
    let active = true;
    void fetch(src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Image unavailable');
        return response.blob();
      })
      .then(async (blob) => {
        const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
        if (active && matchesRasterHeader(blob.type.toLowerCase(), bytes)) setVerifiedBlob(src);
      })
      .catch(() => {
        // Invalid or revoked local blobs stay on the accessible fallback; never retry over the network.
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [src, dataSource]);

  return dataSource ?? (verifiedBlob === src && isLocalBlobSource(src) ? src : undefined);
}
