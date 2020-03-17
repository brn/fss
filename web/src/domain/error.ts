/**
 * @fileOverview
 * @name error.ts
 * @author Taketoshi Aono
 * @license
 */

export interface Error {
  error: 'FileStorageError';
  description: string;
}

export const error = (description: string) => ({
  error: 'FileStorageError' as const,
  description,
});
