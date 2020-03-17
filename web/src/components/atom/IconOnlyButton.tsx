/**
 * @fileOverview
 * @name TrashButton.tsx
 * @author Taketoshi Aono
 * @license
 */

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Icon, ICON_TYPE } from './Icon';

const style = css`
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  box-shadow: 0px 0px 2px rgba(0, 0, 255, 0);
  border-radius: 99999px;
  :focus {
    position: relative;
    z-index: 1;
    > span {
      color: #0099ff !important;
    }
  }
  :hover {
    > span {
      color: #0066ff;
    }
  }
`;
const IconOnlyButtonContainerElement = styled.button`
  ${style};
`;
const IconOnlyButtonContainerLinkElement = styled.a`
  ${style};
`;

export const IconOnlyButton = ({
  name,
  size,
  link,
  classNameForE2E,
  onClick,
}: {
  name: keyof typeof ICON_TYPE;
  size: number;
  link?: string;
  classNameForE2E: string;
  onClick(): void;
}) => {
  return !link ? (
    <IconOnlyButtonContainerElement
      tabIndex={0}
      onClick={() => onClick()}
      className={classNameForE2E}
    >
      <Icon size={size} name={name} />
    </IconOnlyButtonContainerElement>
  ) : (
    <IconOnlyButtonContainerLinkElement
      href={link}
      tabIndex={0}
      onClick={() => onClick()}
      className={classNameForE2E}
    >
      <Icon size={size} name={name} />
    </IconOnlyButtonContainerLinkElement>
  );
};
