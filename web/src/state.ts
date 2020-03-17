/**
 * @fileOverview
 * @name state.ts
 * @author Taketoshi Aono
 * @license
 */

import { File } from './domain/entities';

export type State = {
  fileStorage: {
    files: File[];
    allFilesCount: number;
    isInitialListFetched: boolean;
    loading: boolean;
    allFilesRefreshLoading: boolean;
    currentOffset: number;
    lastOffset: number;
    modalState: {
      visible: boolean;
      file: File | null;
    };
    error: string | null;
  };
};

export const initialState: State = {
  fileStorage: {
    files: [],
    allFilesCount: 0,
    isInitialListFetched: false,
    loading: false,
    allFilesRefreshLoading: false,
    currentOffset: 1,
    lastOffset: 0,
    modalState: {
      visible: false,
      file: null,
    },
    error: null,
  },
};

export const FILE_DISPLAY_LIMIT = 100;
