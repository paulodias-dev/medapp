const API_ORIGIN = 'https://ssma-gestor.fluxosistemas.com.br';

export function resolveClientAvatarUrl(
  img?: string | null,
  clientId?: number | string,
): string | undefined {
  if (!img || img === 'null' || img === 'undefined') return undefined;

  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('blob:') || img.startsWith('data:')) return img;

  const normalized = img.trim().replace(/^\/+/, '');
  if (!normalized) return undefined;

  if (normalized.startsWith('storage/')) {
    return `${API_ORIGIN}/${normalized}`;
  }

  if (normalized.startsWith('public/')) {
    return `${API_ORIGIN}/storage/${normalized.replace(/^public\/+/, '')}`;
  }

  if (normalized.startsWith('clients/')) {
    return `${API_ORIGIN}/storage/${normalized}`;
  }

  if (clientId) {
    const fileName = normalized.split('/').pop() || normalized;
    return `${API_ORIGIN}/storage/clients/client_${clientId}/${fileName}`;
  }

  return `${API_ORIGIN}/storage/${normalized}`;
}
