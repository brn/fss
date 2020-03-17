/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { css } from '@emotion/core';
import styled from '@emotion/styled';

export const FONT_SIZE_SMALL = '12px';
export const FONT_SIZE_MEDIUM = '14px';
export const FONT_SIZE_LARGE = '16px';
export const FONT_SIZE_XLARGE = '18px';
export const FONT_SIZE_XXLARGE = '20px';

export const regularTextStyle = `
  font-size: ${FONT_SIZE_MEDIUM};
`;

export const RegularText = styled.div`
  ${regularTextStyle};
`;

export const largeTextStyle = css`
  font-size: ${FONT_SIZE_LARGE};
`;

export const LargeText = styled.div`
  ${largeTextStyle};
`;

export const xlargeTextStyle = css`
  font-size: ${FONT_SIZE_XLARGE};
`;

export const xxlargeTextStyle = css`
  font-size: ${FONT_SIZE_XXLARGE};
`;

export const smallTextStyle = css`
  font-size: ${FONT_SIZE_SMALL};
`;

export const sectionTitleStyle = `
  font-size: ${FONT_SIZE_LARGE};
  font-weight: bold
`;
