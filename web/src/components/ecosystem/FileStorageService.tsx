/**
 * @fileOverview
 * @name FileStorageService.tsx
 * @author Taketoshi Aono
 * @license
 */

import React, { useEffect, useMemo, useRef } from 'react';
import moment from 'moment';
import { Global } from '@emotion/core';
import { Layout } from '../organism/Layout';
import { Card } from '../molecules/Card';
import { VirtualizedTableComponent } from '../molecules/VirtualizedTable';
import { iconCSS } from '../atom/Icon';
import { resetStyle } from '../atom/resetStyle';
import { UploadButton, DeleteButton, CancelButton } from '../atom/Button';
import { IconOnlyButton } from '../atom/IconOnlyButton';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../../state';
import {
  initializeFiles,
  uploadFile,
  deleteFile,
  fetchFiles,
  showModal,
  hideModal,
  clearError,
} from '../../actions';
import { TableCellProps } from 'react-virtualized';
import { Paginator } from '../molecules/Pagenator';
import styled from '@emotion/styled';
import { ModalDialog } from '../molecules/ModalDialog';
import { compareOnlyProperties } from '../atom/compareOnlyProperties';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TableContainerElement = styled.div`
  display: flex;
  flex-direction: column;
  height: 70vh;
  width: 70vw;
`;
const ModalContentElement = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DeleteModal = compareOnlyProperties(
  ({
    modalState,
    loading,
  }: {
    loading: boolean;
    modalState: State['fileStorage']['modalState'];
  }) => {
    const dispatch = useDispatch();
    const dialogFirstControlRef = useRef<HTMLElement | undefined>();
    return (
      <ModalDialog
        firstControlRef={dialogFirstControlRef}
        visible={modalState.visible}
        title={`Are you sure, you want to delete ${modalState.file?.name ||
          ''}?`}
      >
        <ModalContentElement>
          <div style={{ marginRight: 10 }}>
            <CancelButton
              loading={loading}
              key={Date.now()}
              ref={dialogFirstControlRef}
              classNameForE2E="e2e__cancel_deletion"
              onClick={() => dispatch(hideModal())}
            />
          </div>
          <DeleteButton
            loading={loading}
            classNameForE2E="e2e__delete"
            onClick={() =>
              modalState.file?.id &&
              dispatch(deleteFile({ id: modalState.file?.id }))
            }
          />
        </ModalContentElement>
      </ModalDialog>
    );
  },
);

export const FileStorageService = compareOnlyProperties(() => {
  const dispatch = useDispatch();
  const fileStorage = useSelector<State, State['fileStorage']>(
    state => state.fileStorage,
  );

  const KEY_SET = useMemo(() => {
    return [
      {
        key: 'name',
        label: 'File Name',
        width: 1000,
      },
      {
        key: 'created_at',
        label: 'Created Datetime',
        width: 1000,
        map(createdAt: string) {
          return moment(createdAt)
            .add(-9, 'hours')
            .format('YYYY/MM/DD HH:mm:ss');
        },
      },
      {
        key: 'download',
        label: '',
        width: 100,
        render(data: TableCellProps) {
          return (
            <div style={{ marginRight: 20 }}>
              <IconOnlyButton
                name="DOWNLOAD"
                size={25}
                classNameForE2E="e2e__download"
                onClick={() => {}}
                link={`${process.env.API_SERVER_URL}/file/${
                  fileStorage.files[data.rowIndex].id
                }`}
              />
            </div>
          );
        },
      },
      {
        key: 'trashcan',
        label: '',
        width: 100,
        render(data: TableCellProps) {
          return (
            <div style={{ marginRight: 20 }}>
              <IconOnlyButton
                name="TRASHCAN"
                size={20}
                classNameForE2E="e2e__show_delete_dialog"
                onClick={() => {
                  dispatch(
                    showModal({ payload: fileStorage.files[data.rowIndex] }),
                  );
                }}
              />
            </div>
          );
        },
      },
    ];
  }, [fileStorage.files]);

  useEffect(() => {
    dispatch(initializeFiles());
  }, []);

  useEffect(() => {
    fileStorage.error &&
      toast.error(fileStorage.error, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    dispatch(clearError());
  }, [fileStorage.error]);

  return (
    <Layout>
      <Global styles={iconCSS} />
      <Global styles={resetStyle} />
      <DeleteModal
        modalState={fileStorage.modalState}
        loading={fileStorage.allFilesRefreshLoading || fileStorage.loading}
      />
      <ToastContainer />
      <Card
        title="File list"
        buttons={
          <UploadButton
            loading={fileStorage.loading || fileStorage.allFilesRefreshLoading}
            classNameForE2E="e2e__upload"
            onClick={file => {
              file && dispatch(uploadFile({ file }));
            }}
          />
        }
      >
        <TableContainerElement>
          <Paginator
            currentPage={fileStorage.currentOffset}
            allPageCount={fileStorage.lastOffset}
            onPageChange={(offset: number) => dispatch(fetchFiles({ offset }))}
          />
          <div style={{ flex: '1 0' }}>
            <VirtualizedTableComponent
              loading={fileStorage.allFilesRefreshLoading}
              rowHeight={80}
              keySet={KEY_SET}
              model={fileStorage.files}
            />
          </div>
        </TableContainerElement>
      </Card>
    </Layout>
  );
});
