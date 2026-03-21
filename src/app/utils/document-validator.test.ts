import { describe, expect, it } from 'vitest';

import {
  digitsOnly,
  isValidCnpj,
  isValidCpf,
  isValidCpfOrCnpj,
} from './document-validator';

describe('document-validator', () => {
  it('normalizes a formatted document to digits only', () => {
    expect(digitsOnly('04.252.011/0001-10')).toBe('04252011000110');
    expect(digitsOnly('111.444.777-35')).toBe('11144477735');
  });

  it('validates CPF correctly', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
    expect(isValidCpf('11144477735')).toBe(true);
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });

  it('validates CNPJ correctly', () => {
    expect(isValidCnpj('04.252.011/0001-10')).toBe(true);
    expect(isValidCnpj('04252011000110')).toBe(true);
    expect(isValidCnpj('11.111.111/1111-11')).toBe(false);
  });

  it('validates CPF or CNPJ based on normalized length', () => {
    expect(isValidCpfOrCnpj('111.444.777-35')).toBe(true);
    expect(isValidCpfOrCnpj('04.252.011/0001-10')).toBe(true);
    expect(isValidCpfOrCnpj('123')).toBe(false);
  });
});
