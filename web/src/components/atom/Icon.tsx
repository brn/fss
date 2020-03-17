/**
 * @fileOverview
 * @name Icon.tsx
 * @author Taketoshi Aono
 * @license
 */

import React from 'react';
import { css } from '@emotion/core';
import styled from '@emotion/styled';

export const iconCSS = css`
  @font-face {
    font-family: 'icons';
    src: url(/icons/icons.eot?08f06fa831f80ba6717e51c8bc012066?#iefix)
        format('embedded-opentype'),
      url(/icons/icons.woff2?08f06fa831f80ba6717e51c8bc012066) format('woff2'),
      url(/icons/icons.woff?08f06fa831f80ba6717e51c8bc012066) format('woff'),
      url(/icons/icons.ttf?08f06fa831f80ba6717e51c8bc012066) format('truetype'),
      url(/icons/icons.svg?08f06fa831f80ba6717e51c8bc012066#AimIcons)
        format('svg');
  }
`;

const IconContainerElement = styled.span<{
  size: string;
  color: string;
}>`
  font-family: icons !important;
  font-style: normal;
  font-weight: normal !important;
  line-height: 1;
  vertical-align: middle;
  display: inline-block;
  width: ${p => p.size};
  height: ${p => p.size};
  color: ${p => p.color};
  font-size: ${p => p.size};
  transition: all 0.3s;
`;

export const ICON_TYPE = {
  TRASHCAN: 'a',
  PLUS: 'b',
  UPLOAD: 'c',
  CIRCLE_ARROW: 'd',
  DOWNLOAD: 'e',
};

export const Icon = ({
  name,
  size = 20,
  color = '#000',
}: {
  name: keyof typeof ICON_TYPE;
  size?: string | number;
  color?: string;
}) => {
  return (
    <IconContainerElement
      size={typeof size === 'number' ? `${size}px` : size}
      color={color}
    >
      {ICON_TYPE[name]}
    </IconContainerElement>
  );
};
