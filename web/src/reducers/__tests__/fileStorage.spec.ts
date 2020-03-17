/**
 * @fileOverview
 * @name fileStorage.spec.ts
 * @author Taketoshi Aono
 * @license
 */

import { fileStorage } from '../fileStorage';
import { initialState } from '../../state';
import {
  apiFailed,
  showModal,
  allFilesCountUpdated,
  hideModal,
  beginAllFilesRefreshLoading,
  exitAllFilesRefreshLoading,
  beginLoading,
  exitLoading,
  filesUpdated,
  pagenate,
  clearError,
  fixOffset,
} from '../../actions';
import * as assert from 'power-assert';
import { error } from '../../domain/error';

describe('fileStorage', () => {
  let clone: typeof initialState.fileStorage;
  const file = { name: 'test', created_at: Date.now(), id: 1 };
  beforeEach(() => {
    clone = JSON.parse(JSON.stringify(initialState.fileStorage));
  });

  describe('API_FAILED', () => {
    it('should update error message', () => {
      const state = fileStorage(clone, apiFailed(error('error')));
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, { ...clone, error: 'error' });
    });
  });

  describe('SHOW_MODAL', () => {
    it('should update modalState to show', () => {
      const state = fileStorage(clone, showModal({ payload: file }));
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        modalState: { visible: true, file },
      });
    });
  });

  describe('HIDE_MODAL', () => {
    it('should update modalState to hide', () => {
      clone.modalState.file = file;
      const state = fileStorage(clone, hideModal());
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        modalState: { visible: false, file: null },
      });
    });
  });

  describe('ALL_FILES_COUNT_UPDATED', () => {
    it('should update pagenation state', () => {
      const state = fileStorage(
        clone,
        allFilesCountUpdated({ payload: { count: 1000 } }),
      );
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        currentOffset: 1,
        lastOffset: 10,
        allFilesCount: 1000,
      });
    });
  });

  describe('BEGIN_REFRESH_LOADING', () => {
    it('should update allFilesRefreshLoading state to start', () => {
      const state = fileStorage(clone, beginAllFilesRefreshLoading());
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        allFilesRefreshLoading: true,
      });
    });
  });

  describe('EXIT_REFRESH_LOADING', () => {
    it('should update allFilesRefreshLoading state to exit', () => {
      const state = fileStorage(clone, exitAllFilesRefreshLoading());
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        allFilesRefreshLoading: false,
      });
    });
  });

  describe('BEGIN_LOADING', () => {
    it('should update loading state to start', () => {
      const state = fileStorage(clone, beginLoading());
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        loading: true,
      });
    });
  });

  describe('EXIT_LOADING', () => {
    it('should update loading state to exit', () => {
      const state = fileStorage(clone, exitLoading());
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        loading: false,
      });
    });
  });

  describe('FILES_UPDATED', () => {
    it('should refresh all files', () => {
      clone.files = Array(100)
        .fill(null)
        .map((_, i) => ({ name: `file_${i}`, id: i, created_at: Date.now() }));
      clone.allFilesCount = 100;
      const newFiles = clone.files.slice();
      const state = fileStorage(clone, filesUpdated({ payload: newFiles }));
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state.files, clone.files);
    });
  });

  describe('PAGENATE', () => {
    it('should update pagenation state', () => {
      const state = fileStorage(clone, pagenate({ offset: 2 }));
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        currentOffset: 2,
      });
    });
  });

  describe('CLEAR_ERROR', () => {
    it('should clear error', () => {
      clone.error = 'error';
      const state = fileStorage(clone, clearError());
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        error: null,
      });
    });
  });

  describe('FIX_OFFSET', () => {
    it('should fix offset', () => {
      clone.allFilesCount = 1001;
      clone.currentOffset = 11;
      clone.lastOffset = 11;
      const state = fileStorage(clone, fixOffset({ payload: -1 }));
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        allFilesCount: 1000,
        currentOffset: 10,
        lastOffset: 10,
      });
    });

    it('should not fix offset if current offset not over all offset', () => {
      clone.allFilesCount = 1000;
      clone.currentOffset = 10;
      clone.lastOffset = 10;
      const state = fileStorage(clone, fixOffset({ payload: -1 }));
      assert.notStrictEqual(state, clone);
      assert.deepStrictEqual(state, {
        ...clone,
        allFilesCount: 999,
        currentOffset: 10,
        lastOffset: 10,
      });
    });
  });
});
