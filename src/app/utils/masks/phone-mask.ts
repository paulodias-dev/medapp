/**
 * @param string - A string a ser formatada como um número de telefone.
 * @returns O número de telefone formatado.
 * Compatível com: Fax, Telefone fixo e telefone celular.
 */

export function phoneMask(string?: string): string {
  if (!string) return '';

  return string
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
    .replace(/(-\d{4})\d+?$/, '$1');
}
