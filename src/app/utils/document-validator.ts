export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCpf(value: string): boolean {
  const cpf = digitsOnly(value);

  if (cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split('').map(Number);

  const firstDigit = calculateCpfDigit(digits.slice(0, 9), 10);
  const secondDigit = calculateCpfDigit(digits.slice(0, 10), 11);

  return firstDigit === digits[9] && secondDigit === digits[10];
}

function calculateCpfDigit(baseDigits: number[], factor: number): number {
  const sum = baseDigits.reduce((accumulator, current, index) => {
    return accumulator + current * (factor - index);
  }, 0);

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function isValidCnpj(value: string): boolean {
  const cnpj = digitsOnly(value);

  if (cnpj.length !== 14) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const digits = cnpj.split('').map(Number);
  const firstDigit = calculateCnpjDigit(digits.slice(0, 12));
  const secondDigit = calculateCnpjDigit(digits.slice(0, 13));

  return firstDigit === digits[12] && secondDigit === digits[13];
}

function calculateCnpjDigit(baseDigits: number[]): number {
  const weights =
    baseDigits.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const sum = baseDigits.reduce((accumulator, current, index) => {
    return accumulator + current * weights[index];
  }, 0);

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpfOrCnpj(value: string): boolean {
  const normalized = digitsOnly(value);

  if (normalized.length === 11) {
    return isValidCpf(normalized);
  }

  if (normalized.length === 14) {
    return isValidCnpj(normalized);
  }

  return false;
}
