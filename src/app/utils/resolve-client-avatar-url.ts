const API_ORIGIN = 'https://ssma-gestor.fluxosistemas.com.br';

export function resolveClientAvatarUrl(
  img?: string | null,
  clientId?: number | string,
  cacheKey?: string | number | null,
): string | undefined {
  if (!img || img === 'null' || img === 'undefined') return undefined;

  if (img.startsWith('http://') || img.startsWith('https://')) {
    return appendVersion(img, cacheKey);
  }
  if (img.startsWith('blob:') || img.startsWith('data:')) return img;

  const normalized = img.trim().replace(/^\/+/, '');
  if (!normalized) return undefined;

  if (normalized.startsWith('storage/')) {
    return appendVersion(`${API_ORIGIN}/${normalized}`, cacheKey);
  }

  if (normalized.startsWith('public/')) {
    return appendVersion(
      `${API_ORIGIN}/storage/${normalized.replace(/^public\/+/, '')}`,
      cacheKey,
    );
  }

  if (normalized.startsWith('clients/')) {
    return appendVersion(`${API_ORIGIN}/storage/${normalized}`, cacheKey);
  }

  if (clientId) {
    const fileName = normalized.split('/').pop() || normalized;
    return appendVersion(
      `${API_ORIGIN}/storage/clients/client_${clientId}/${fileName}`,
      cacheKey,
    );
  }

  return appendVersion(`${API_ORIGIN}/storage/${normalized}`, cacheKey);
}

function appendVersion(url: string, cacheKey?: string | number | null): string {
  if (!cacheKey) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(String(cacheKey))}`;
}
