/**
 * @fileOverview
 * @name files.ts
 * @author Taketoshi Aono
 * @license
 */

import {
  ActionType,
  filesUpdated,
  beginLoading,
  exitLoading,
  beginAllFilesRefreshLoading,
  exitAllFilesRefreshLoading,
  allFilesCountUpdated,
  pagenate,
  showModal,
  hideModal,
  apiFailed,
  clearError,
  fixOffset,
} from '../actions';
import { State, initialState, FILE_DISPLAY_LIMIT } from '../state';

type ActionTypes =
  | ActionType<typeof filesUpdated>
  | ActionType<typeof beginLoading>
  | ActionType<typeof exitLoading>
  | ActionType<typeof beginAllFilesRefreshLoading>
  | ActionType<typeof exitAllFilesRefreshLoading>
  | ActionType<typeof allFilesCountUpdated>
  | ActionType<typeof pagenate>
  | ActionType<typeof showModal>
  | ActionType<typeof hideModal>
  | ActionType<typeof apiFailed>
  | ActionType<typeof clearError>
  | ActionType<typeof fixOffset>;

export const fileStorage = (
  state = initialState.fileStorage,
  action: ActionTypes,
): State['fileStorage'] => {
  switch (action.type) {
    case 'FIX_OFFSET': {
      const allFilesCount = state.allFilesCount + action.payload;
      const lastOffset = Math.round(allFilesCount / FILE_DISPLAY_LIMIT);
      return {
        ...state,
        lastOffset,
        allFilesCount,
        currentOffset:
          state.currentOffset > lastOffset ? lastOffset : state.currentOffset,
      };
    }
    case 'API_FAILED':
      return {
        ...state,
        error: action.payload.description,
      };
    case 'SHOW_MODAL':
      return {
        ...state,
        modalState: {
          visible: true,
          file: action.payload,
        },
      };
    case 'HIDE_MODAL':
      return {
        ...state,
        modalState: {
          visible: false,
          file: null,
        },
      };
    case 'ALL_FILES_COUNT_UPDATED':
      return {
        ...state,
        lastOffset: Math.round(action.payload.count / FILE_DISPLAY_LIMIT),
        allFilesCount: action.payload.count,
      };
    case 'BEGIN_REFRESH_LOADING':
      return {
        ...state,
        allFilesRefreshLoading: true,
      };
    case 'EXIT_REFRESH_LOADING':
      return {
        ...state,
        allFilesRefreshLoading: false,
      };
    case 'BEGIN_LOADING':
      return {
        ...state,
        loading: true,
      };
    case 'EXIT_LOADING':
      return {
        ...state,
        loading: false,
      };
    case 'FILES_UPDATED':
      return {
        ...state,
        files: action.payload,
        isInitialListFetched: true,
      };
    case 'PAGENATE':
      return {
        ...state,
        currentOffset: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};
