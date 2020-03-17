/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { motion, AnimatePresence } from 'framer-motion';
import { regularTextStyle } from './Text';
import { Loading } from './Loading';
import { chooseTextColor } from './styles';
import { compareOnlyProperties } from './compareOnlyProperties';
import { Icon } from './Icon';
import { useRefState } from './hooks';
import uuid from 'uuid';

export enum ButtonType {
  CREATE,
  UPDATE,
  SAVE,
  DELETE,
  NORMAL,
  QUICK_REPLIES,
}
// https://coolors.co/cbcbdd-fe8a83-878ab3-ffd177-fffffc
const TYPE_CONFIG = {
  [ButtonType.CREATE]: {
    background: '#CBCBDD',
    color: chooseTextColor('#CBCBDD'),
  },
  [ButtonType.UPDATE]: {
    background: '#FFD177',
    color: chooseTextColor('#FFD177'),
  },
  [ButtonType.SAVE]: {
    background: '#00CCFF',
    color: chooseTextColor('#00CCFF'),
  },
  [ButtonType.DELETE]: {
    background: '#FE8A83',
    color: chooseTextColor('#FE8A83'),
  },
  [ButtonType.NORMAL]: {
    background: '#F2F2F3',
    color: chooseTextColor('#F2F2F3'),
  },
  [ButtonType.QUICK_REPLIES]: {
    background: '#FFFFFF',
    color: '#0099FF',
  },
};

export interface ButtonProps {
  iconSVG?: React.ReactElement<any>;
  iconName?: string;
  loading?: boolean;
  tabIndex?: number;
  useFile?: boolean;
  onClick?(): void;
  onChange?(file: File | null): void;
  label: string;
  type: ButtonType;
  classNameForE2E: string;
}

const FOCUS_SHADOW = `box-shadow: 0 0.2px 0.2px rgba(0, 0, 0, 0.013),
  0 0.3px 0.3px rgba(0, 0, 0, 0.019),
  0 0.6px 0.6px rgba(0, 0, 0, 0.023),
  0 0.9px 0.9px rgba(0, 0, 0, 0.027),
  0 1.3px 1.3px rgba(0, 0, 0, 0.03),
  0 1.8px 1.8px rgba(0, 0, 0, 0.033),
  0 2.5px 2.5px rgba(0, 0, 0, 0.037),
  0 3.7px 3.7px rgba(0, 0, 0, 0.041),
  0 5.6px 5.6px rgba(0, 0, 0, 0.047),
  0 10px 10px rgba(0, 0, 0, 0.06),
  0px 0px 4px rgba(0, 0, 255, 0.6);`;

const buttonLoadingStyle = css`
  :before {
    transition: all 0.2s;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    transform: scale3d(0, 0, 1);
    transform-origin: center center;
    background: rgba(0, 0, 0, 0.1);
    display: block;
    top: 0px;
    left: 0px;
    opacity: 0;
  }
  :hover {
    outline: initial;
    :before {
      transform: scale3d(1, 1, 1);
      opacity: 1;
    }
  }
`;
const ButtonContainerElement = styled<
  {
    css: { background: string; color: string; border: string; hover: string };
    isLoading: boolean;
  } & any
>(motion.button)`
  position: relative;
  outline: none;
  box-sizing: border-box;
  border: 0;
  display: inline-block;
  padding: 7px 15px;
  box-shadow: 0 0.2px 0.2px rgba(0, 0, 0, 0.013),
    0 0.3px 0.3px rgba(0, 0, 0, 0.019), 0 0.6px 0.6px rgba(0, 0, 0, 0.023),
    0 0.9px 0.9px rgba(0, 0, 0, 0.027), 0 1.3px 1.3px rgba(0, 0, 0, 0.03),
    0 1.8px 1.8px rgba(0, 0, 0, 0.033), 0 2.5px 2.5px rgba(0, 0, 0, 0.037),
    0 3.7px 3.7px rgba(0, 0, 0, 0.041), 0 5.6px 5.6px rgba(0, 0, 0, 0.047),
    0 10px 10px rgba(0, 0, 0, 0.06);
  background: ${props => props.css.background};
  color: ${props => props.css.color};
  position: relative;
  overflow: hidden;
  cursor: ${props => (!props.isLoading ? 'pointer' : 'auto')};
  border-radius: 5px;
  :focus {
    ${FOCUS_SHADOW};
  }
  ${props => (!props.isLoading ? buttonLoadingStyle : '')};
`;

const ButtonInnerContainerElement = styled.span`
  display: flex;
  align-items: center;
`;

const ButtonTextContainer = styled.span`
  display: inline-block;
  ${regularTextStyle};
`;

const FileInput = styled.input`
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
`;

export const Button = compareOnlyProperties(
  forwardRef(
    (
      {
        iconSVG,
        label,
        type,
        loading,
        useFile,
        classNameForE2E,
        tabIndex = 0,
        onClick = () => {},
        onChange = () => {},
      }: ButtonProps,
      ref: React.Ref<HTMLElement | null>,
    ) => {
      const [fileId, setFileId] = useRefState(uuid.v4());
      return (
        <ButtonContainerElement
          ref={ref}
          type="button"
          isLoading={!!loading}
          css={TYPE_CONFIG[type]}
          whileHover={
            !loading
              ? {
                  scale: 0.98,
                }
              : {}
          }
          whileTap={!loading ? { scale: 0.9 } : {}}
          transition={{ type: 'spring' }}
          tabIndex={tabIndex}
          aria-label={label}
          aria-busy={loading}
          onClick={() => !useFile && onClick()}
          className={useFile ? '' : classNameForE2E}
        >
          <AnimatePresence>
            {loading ? <Loading scale={0.2} /> : null}
          </AnimatePresence>
          <ButtonInnerContainerElement
            style={{ visibility: loading ? 'hidden' : 'visible' }}
            aria-hidden={true}
          >
            {useFile ? (
              <FileInput
                key={fileId.current}
                type="file"
                className={classNameForE2E}
                onChange={e => {
                  useFile && onChange(e.currentTarget.files?.[0] || null);
                  setFileId(uuid.v4());
                }}
              />
            ) : null}
            {iconSVG ? (
              <span
                style={{
                  width: 15,
                  height: 15,
                  marginRight: 10,
                  display: 'inline-block',
                }}
              >
                {iconSVG}
              </span>
            ) : null}
            <ButtonTextContainer style={{ whiteSpace: 'nowrap' }}>
              {label}
            </ButtonTextContainer>
          </ButtonInnerContainerElement>
        </ButtonContainerElement>
      );
    },
  ),
);

export const UploadButton = compareOnlyProperties(
  ({
    label = 'Upload image',
    loading = false,
    classNameForE2E,
    onClick,
  }: {
    label?: string;
    loading?: boolean;
    classNameForE2E: string;
    onClick(file: File | null): void;
  }) => {
    return (
      <Button
        loading={loading}
        label={label}
        useFile={true}
        type={ButtonType.SAVE}
        iconSVG={<Icon size={15} color="#000" name="UPLOAD" />}
        onChange={file => onClick(file)}
        classNameForE2E={classNameForE2E}
      />
    );
  },
);

export const DeleteButton = compareOnlyProperties(
  ({
    label = 'Delete',
    loading = false,
    classNameForE2E,
    onClick,
  }: {
    label?: string;
    loading?: boolean;
    classNameForE2E: string;
    onClick(): void;
  }) => {
    return (
      <Button
        loading={loading}
        label={label}
        type={ButtonType.DELETE}
        iconSVG={<Icon size={15} color="#000" name="TRASHCAN" />}
        onClick={() => onClick()}
        classNameForE2E={classNameForE2E}
      />
    );
  },
);

export const CancelButton = compareOnlyProperties(
  forwardRef(
    (
      {
        label = 'Cancel',
        loading = false,
        classNameForE2E,
        onClick,
      }: {
        label?: string;
        loading?: boolean;
        classNameForE2E: string;
        onClick(): void;
      },
      ref: React.Ref<any>,
    ) => {
      return (
        <Button
          ref={ref}
          loading={loading}
          label={label}
          type={ButtonType.NORMAL}
          classNameForE2E={classNameForE2E}
          onClick={() => onClick()}
        />
      );
    },
  ),
);
