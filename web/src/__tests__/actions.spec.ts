/**
 * @fileOverview
 * @name actions.spec.ts
 * @author Taketoshi Aono
 * @license
 */

import { Action, Dispatch } from 'redux';
import { File } from '../domain/entities';
import fetchMock from 'fetch-mock';
import {
  initializeFiles,
  beginAllFilesRefreshLoading,
  filesUpdated,
  exitAllFilesRefreshLoading,
  allFilesCountUpdated,
  apiFailed,
  fetchFiles,
  pagenate,
  beginLoading,
  exitLoading,
  uploadFile,
  deleteFile,
  hideModal,
  fixOffset,
} from '../actions';
import * as assert from 'power-assert';
import { error } from '../domain/error';
import { FILE_DISPLAY_LIMIT } from '../state';

describe('thunked-actions', () => {
  type ExAction = Action<any> & { [key: string]: any };
  const dispatcherFactory = (): [Dispatch, ExAction[]] => {
    const dispatched: ExAction[] = [];
    return [
      <T extends Action>(action: T): T => {
        dispatched.push(action);
        return action;
      },
      dispatched,
    ];
  };

  const SERVER_URL = 'http://localhost:8080';
  let files: File[];
  beforeAll(() => {
    process.env.API_SERVER_URL = SERVER_URL;
    files = Array(10)
      .fill(null)
      .map((_, i) => ({
        id: i,
        name: `file_${i}`,
        /* eslint @typescript-eslint/camelcase: 0 */
        created_at: Date.now(),
        /* eslint @typescript-eslint/camelcase: 1 */
      }));
  });

  afterEach(() => {
    fetchMock.restore();
  });

  describe('initializeFiles', () => {
    it('should fetch initial files and count', async () => {
      fetchMock.get(`${SERVER_URL}/count`, {
        status: 200,
        body: { count: 10 },
      });
      fetchMock.get(`${SERVER_URL}/list?offset=1&limit=${FILE_DISPLAY_LIMIT}`, {
        status: 200,
        body: files,
      });

      const [dispatch, stack] = dispatcherFactory();
      const thunk = initializeFiles();
      await thunk(dispatch);
      assert.deepStrictEqual(stack, [
        beginAllFilesRefreshLoading(),
        allFilesCountUpdated({ payload: { count: 10 } }),
        filesUpdated({ payload: files }),
        exitAllFilesRefreshLoading(),
      ]);
    });

    it('should notify error if fetch count failed', async () => {
      fetchMock.get(`${SERVER_URL}/count`, {
        status: 500,
        body: error('error'),
      });
      fetchMock.get(`${SERVER_URL}/list?offset=1&limit=${FILE_DISPLAY_LIMIT}`, {
        status: 200,
        body: files,
      });

      const [dispatch, stack] = dispatcherFactory();
      const thunk = initializeFiles();
      await thunk(dispatch);
      assert.deepStrictEqual(stack, [
        beginAllFilesRefreshLoading(),
        apiFailed(error('error')),
        exitAllFilesRefreshLoading(),
      ]);
    });

    it('should notify error if fetch files failed', async () => {
      fetchMock.get(`${SERVER_URL}/count`, {
        status: 200,
        body: { count: 10 },
      });
      fetchMock.get(`${SERVER_URL}/list?offset=1&limit=${FILE_DISPLAY_LIMIT}`, {
        status: 500,
        body: error('error'),
      });

      const [dispatch, stack] = dispatcherFactory();
      const thunk = initializeFiles();
      await thunk(dispatch);
      assert.deepStrictEqual(stack, [
        beginAllFilesRefreshLoading(),
        allFilesCountUpdated({ payload: { count: 10 } }),
        apiFailed(error('error')),
        exitAllFilesRefreshLoading(),
      ]);
    });
  });

  describe('fetchFiles', () => {
    it('should fetch next files', async () => {
      fetchMock.get(`${SERVER_URL}/list?offset=2&limit=${FILE_DISPLAY_LIMIT}`, {
        status: 200,
        body: files,
      });

      const [dispatch, stack] = dispatcherFactory();
      const thunk = fetchFiles({ offset: 2 });
      await thunk(dispatch);
      assert.deepStrictEqual(stack, [
        beginAllFilesRefreshLoading(),
        filesUpdated({ payload: files }),
        pagenate({ offset: 2 }),
        exitAllFilesRefreshLoading(),
      ]);
    });

    it('should notify error and not update offset', async () => {
      fetchMock.get(`${SERVER_URL}/list?offset=2&limit=${FILE_DISPLAY_LIMIT}`, {
        status: 500,
        body: error('error'),
      });

      const [dispatch, stack] = dispatcherFactory();
      const thunk = fetchFiles({ offset: 2 });
      await thunk(dispatch);
      assert.deepStrictEqual(stack, [
        beginAllFilesRefreshLoading(),
        apiFailed(error('error')),
        exitAllFilesRefreshLoading(),
      ]);
    });
  });

  describe('uploadFile', () => {
    it('should upload file', async () => {
      fetchMock.post(`${SERVER_URL}/upload`, {
        status: 200,
        body: files[0],
      });

      fetchMock.get(`${SERVER_URL}/list?offset=1&limit=${FILE_DISPLAY_LIMIT}`, {
        status: 200,
        body: files,
      });

      const [dispatch, stack] = dispatcherFactory();
      const thunk = uploadFile({ file: new Blob() });
      await thunk(dispatch, () => {
        return {
          fileStorage: { currentOffset: 1 },
        };
      });
      assert.deepStrictEqual(stack, [
        beginLoading(),
        fixOffset({ payload: 1 }),
        filesUpdated({ payload: files }),
        exitLoading(),
      ]);
    });

    it('should notify error', async () => {
      fetchMock.post(`${SERVER_URL}/upload`, {
        status: 500,
        body: error('error'),
      });

      fetchMock.get(`${SERVER_URL}/list?offset=1&limit=${FILE_DISPLAY_LIMIT}`, {
        status: 200,
        body: files,
      });

      const [dispatch, stack] = dispatcherFactory();
      const thunk = uploadFile({ file: new Blob() });
      await thunk(dispatch, () => {
        return {
          fileStorage: { currentOffset: 1 },
        };
      });
      assert.deepStrictEqual(stack, [
        beginLoading(),
        apiFailed(error('error')),
        exitLoading(),
      ]);
    });
  });

  describe('deleteFile', () => {
    it('should delete file', async () => {
      fetchMock.delete(`${SERVER_URL}/file/1`, {
        status: 200,
        body: {},
      });
      fetchMock.get(`${SERVER_URL}/list?offset=1&limit=${FILE_DISPLAY_LIMIT}`, {
        status: 200,
        body: files,
      });

      const [dispatch, stack] = dispatcherFactory();
      const thunk = deleteFile({ id: 1 });
      await thunk(dispatch, () => ({ fileStorage: { currentOffset: 1 } }));
      assert.deepStrictEqual(stack, [
        beginLoading(),
        fixOffset({ payload: -1 }),
        filesUpdated({ payload: files }),
        hideModal(),
        exitLoading(),
      ]);
    });

    it('should notify error', async () => {
      fetchMock.delete(`${SERVER_URL}/file/1`, {
        status: 500,
        body: error('error'),
      });

      const [dispatch, stack] = dispatcherFactory();
      const thunk = deleteFile({ id: 1 });
      await thunk(dispatch, () => ({ fileStorage: { currentOffset: 1 } }));
      assert.deepStrictEqual(stack, [
        beginLoading(),
        apiFailed(error('error')),
        hideModal(),
        exitLoading(),
      ]);
    });
  });
});
