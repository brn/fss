/**
 * @fileOverview
 * @name actions.ts
 * @author Taketoshi Aono
 * @license
 */

import { File as FileEntity } from './domain/entities';
import { Error, error } from './domain/error';
import { Dispatch, Action } from 'redux';
import { State, FILE_DISPLAY_LIMIT } from './state';

export type ActionType<T extends (...a: any[]) => any> = ReturnType<T>;

const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const loadingAdvice = (cb: (...a: any[]) => Promise<any>) => {
  return async (dispatch: Dispatch, ...rest: any[]) => {
    dispatch(beginLoading());
    await cb(dispatch, ...rest);
    await sleep(300); // For comfortable transition.
    dispatch(exitLoading());
  };
};

const refreshLoadingAdvice = (cb: (...a: any[]) => Promise<any>) => {
  return async (dispatch: Dispatch, ...rest: any[]) => {
    dispatch(beginAllFilesRefreshLoading());
    await cb(dispatch, ...rest);
    await sleep(300); // For comfortable transition.
    dispatch(exitAllFilesRefreshLoading());
  };
};

class NotifyableError {
  constructor(public action: Action<any>) {}
  public static dispatchOr(
    dispatch: Dispatch,
    error: NotifyableError | Error,
  ): Action<any> {
    if (error instanceof NotifyableError) {
      return dispatch(error.action);
    }
    throw error;
  }
}

const getAllFilesCount = async (dispatch: Dispatch) => {
  const response = await fetch(`${process.env.API_SERVER_URL}/count`);
  if (response.ok) {
    return allFilesCountUpdated({ payload: await response.json() });
  } else if (response.status >= 500 && response.status <= 600) {
    throw new NotifyableError(apiFailed(await response.json()));
  }

  throw new NotifyableError(
    apiFailed(error('Error occured, please retry later.')),
  );
};

const fetchList = async ({
  offset,
}: {
  offset: number;
}): Promise<Action<any>> => {
  const response = await fetch(
    `${process.env.API_SERVER_URL}/list?offset=${offset}&limit=${FILE_DISPLAY_LIMIT}`,
  );
  if (response.ok) {
    return filesUpdated({ payload: await response.json() });
  } else if (response.status >= 500 && response.status <= 600) {
    throw new NotifyableError(apiFailed(await response.json()));
  }
  throw new NotifyableError(
    apiFailed(error('Error occured, please retry later.')),
  );
};

export const initializeFiles = () => {
  return refreshLoadingAdvice(async (dispatch: Dispatch) => {
    try {
      dispatch(await getAllFilesCount(dispatch));
      dispatch(await fetchList({ offset: 1 }));
    } catch (e) {
      NotifyableError.dispatchOr(dispatch, e);
    }
  });
};

export const fetchFiles = ({ offset }: { offset: number }) => {
  return refreshLoadingAdvice(async (dispatch: Dispatch) => {
    try {
      dispatch(await fetchList({ offset }));
      dispatch(pagenate({ offset }));
    } catch (e) {
      NotifyableError.dispatchOr(dispatch, e);
    }
  });
};

export const uploadFile = ({ file }: { file: Blob }) => {
  return loadingAdvice(async (dispatch: Dispatch, getState) => {
    const fd = new FormData();
    fd.append('file', file);
    const response = await fetch(`${process.env.API_SERVER_URL}/upload`, {
      method: 'POST',
      body: fd,
      mode: 'cors',
    });
    if (response.ok) {
      dispatch(fixOffset({ payload: 1 }));
      const {
        fileStorage: { currentOffset: offset },
      }: State = getState();
      return dispatch(await fetchList({ offset }));
    } else if (response.status >= 500 && response.status <= 600) {
      dispatch(apiFailed(await response.json()));
    } else {
      dispatch(apiFailed(error('Error occured, please retry later.')));
    }
  });
};

export const deleteFile = ({ id }: { id: number }) => {
  return loadingAdvice(async (dispatch: Dispatch, getState) => {
    try {
      const response = await fetch(`${process.env.API_SERVER_URL}/file/${id}`, {
        method: 'DELETE',
        body: '{}',
        mode: 'cors',
      });
      if (response.ok) {
        dispatch(fixOffset({ payload: -1 }));
        const {
          fileStorage: { currentOffset: offset },
        }: State = getState();
        return dispatch(await fetchList({ offset }));
      } else if (response.status >= 500 && response.status <= 600) {
        throw new NotifyableError(apiFailed(await response.json()));
      }
      throw new NotifyableError(
        apiFailed(error('Error occured, please retry later.')),
      );
    } catch (e) {
      NotifyableError.dispatchOr(dispatch, e);
    } finally {
      dispatch(hideModal());
    }
  });
};

export const apiFailed = (error: Error) => {
  return {
    type: 'API_FAILED' as const,
    payload: error,
  };
};

export const filesUpdated = ({ payload }: { payload: FileEntity[] }) => {
  return {
    type: 'FILES_UPDATED' as const,
    payload,
  };
};

export const beginLoading = () => {
  return {
    type: 'BEGIN_LOADING' as const,
  };
};

export const exitLoading = () => {
  return {
    type: 'EXIT_LOADING' as const,
  };
};

export const beginAllFilesRefreshLoading = () => {
  return {
    type: 'BEGIN_REFRESH_LOADING' as const,
  };
};

export const exitAllFilesRefreshLoading = () => {
  return {
    type: 'EXIT_REFRESH_LOADING' as const,
  };
};

export const allFilesCountUpdated = ({
  payload,
}: {
  payload: { count: number };
}) => {
  return {
    type: 'ALL_FILES_COUNT_UPDATED' as const,
    payload,
  };
};

export const pagenate = ({ offset }: { offset: number }) => {
  return {
    type: 'PAGENATE' as const,
    payload: offset,
  };
};

export const showModal = ({ payload }: { payload: FileEntity }) => {
  return {
    type: 'SHOW_MODAL' as const,
    payload,
  };
};

export const hideModal = () => {
  return {
    type: 'HIDE_MODAL' as const,
  };
};

export const clearError = () => {
  return {
    type: 'CLEAR_ERROR' as const,
  };
};

export const fixOffset = ({ payload }: { payload: number }) => {
  return {
    type: 'FIX_OFFSET' as const,
    payload,
  };
};
