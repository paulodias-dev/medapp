export function getCompanyImageUrl(clientId: number, img: string | null) {
  if (!img) return '/grupo-ssma.png'; // Fallback to default
  if (img.startsWith('http')) return img;
  
  return `https://ssma-gestor.fluxosistemas.com.br/storage/clients/client_${clientId}/${img}`;
}
