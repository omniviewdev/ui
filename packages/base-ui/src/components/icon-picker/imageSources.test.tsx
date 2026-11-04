import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isLocalBlobSource, safeRasterDataSource, useSafeRasterSource } from './imageSources';

const PNG_BYTES = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const encode = (type: string, bytes: Uint8Array) =>
  `data:${type};base64,${btoa(String.fromCharCode(...bytes))}`;

function blobResponse(type: string, bytes: Uint8Array) {
  return {
    ok: true,
    blob: async () => ({ type, slice: () => ({ arrayBuffer: async () => bytes.buffer }) }),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('IconPicker raster preview boundaries', () => {
  it.each([
    ['image/png', PNG_BYTES],
    ['image/jpeg', new Uint8Array([255, 216, 255, 224])],
    ['image/gif', new TextEncoder().encode('GIF89a')],
    ['image/webp', new TextEncoder().encode('RIFF0000WEBP')],
  ])('accepts a matching %s raster header', (type, bytes) => {
    const src = encode(type as string, bytes as Uint8Array);
    expect(safeRasterDataSource(src)).toBe(src);
  });

  it.each([
    'https://example.invalid/pixel.png',
    '//example.invalid/pixel.png',
    '/pixel.png',
    'file:///tmp/pixel.png',
    'javascript:alert(1)',
    'data:image/svg+xml;base64,PHN2Zy8+',
    'data:text/html;base64,PHN2Zy8+',
    'data:image/png;base64,PHN2Zy8+',
    'data:image/png;base64,iVBORw0KGgo?AAAA',
    'data:image/png;base64,iVBORw0KGgo',
    'data:image/jpeg;base64,iVBORw0KGgo=',
    'data:image/png,not-base64',
  ])('rejects unsafe or mislabeled data: %s', (src) => {
    expect(safeRasterDataSource(src)).toBeUndefined();
  });

  it('never fetches network URLs or foreign-origin blobs', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result, rerender } = renderHook(({ src }) => useSafeRasterSource(src), {
      initialProps: { src: 'https://example.invalid/tracker.png' },
    });
    expect(result.current).toBeUndefined();
    rerender({ src: 'blob:https://example.invalid/image' });
    expect(result.current).toBeUndefined();
    expect(isLocalBlobSource('blob:https://example.invalid/image')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('withholds local blob URLs until raster MIME and bytes match, aborting on source change', async () => {
    const fetchMock = vi.fn().mockResolvedValue(blobResponse('image/png', PNG_BYTES));
    vi.stubGlobal('fetch', fetchMock);
    const src = `blob:${window.location.origin}/valid-raster`;
    const { result, rerender } = renderHook(({ source }) => useSafeRasterSource(source), {
      initialProps: { source: src },
    });
    expect(result.current).toBeUndefined();
    await waitFor(() => expect(result.current).toBe(src));
    expect(fetchMock).toHaveBeenCalledWith(src, { signal: expect.any(AbortSignal) });
    const request = fetchMock.mock.calls[0];
    if (!request) throw new Error('Expected a local blob verification request.');
    const signal = request[1].signal as AbortSignal;
    rerender({ source: 'https://example.invalid/no-request' });
    expect(result.current).toBeUndefined();
    expect(signal.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['image/svg+xml', new TextEncoder().encode('<svg/>')],
    ['image/png', new TextEncoder().encode('<svg/>')],
    ['image/jpeg', PNG_BYTES],
  ])('rejects a local %s blob that is not a matching raster', async (type, bytes) => {
    const response = vi.fn().mockResolvedValue(blobResponse(type as string, bytes as Uint8Array));
    vi.stubGlobal('fetch', response);
    const { result } = renderHook(() =>
      useSafeRasterSource(`blob:${window.location.origin}/invalid`),
    );
    await waitFor(() => expect(response).toHaveBeenCalledTimes(1));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toBeUndefined();
  });

  it('keeps revoked or failed local blobs on fallback without an unhandled rejection', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Blob revoked'));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() =>
      useSafeRasterSource(`blob:${window.location.origin}/revoked`),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toBeUndefined();
  });
});
