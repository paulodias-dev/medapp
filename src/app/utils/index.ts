export * from './capitalize-first-letter';
export * from './currency-string-number';
export * from './format-currency';
export * from './format-date';
export * from './resolve-client-avatar-url';

export * from './masks';

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
