export function pisPasepMask(string: string) {
  if (!string) return '';

  return string
    .replace(/\D/g, '')
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{5})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{5})\.(\d{2})(\d)/, '$1.$2.$3-$4');
}
