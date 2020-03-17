/**
 * @fileOverview
 * @name styles.ts
 * @author Taketoshi Aono
 * @license
 */

import { keyframes, css } from '@emotion/core';

export const skeletonAnim = keyframes`
  0% {
    opacity: 0.6
  }
  100% {
    opacity: 1
  }
`;

export const skeletonAnimationStyle = css`
  animation: 0.6s ${skeletonAnim} infinite alternate-reverse;
`;

export const scrollbarStyle = css`
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 20px;
  }

  &::-webkit-scrollbar-track {
    background: #fff;
    border-radius: 20px;
  }
`;

const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
const hexToRgb = (hex: string) => {
  var result = hex.match(HEX_REGEX);
  return result
    ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
      }
    : null;
};

export const chooseTextColor = (hex: string) => {
  const ret = hexToRgb(hex);
  if (ret) {
    const { red, green, blue } = ret;

    const toRgbItem = (item: number) => {
      const i = item / 255;
      return i <= 0.03928 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4);
    };
    const R = toRgbItem(red);
    const G = toRgbItem(green);
    const B = toRgbItem(blue);
    const Lbg = 0.2126 * R + 0.7152 * G + 0.0722 * B;

    const Lw = 1;
    const Lb = 0;

    const Cw = (Lw + 0.05) / (Lbg + 0.05);
    const Cb = (Lbg + 0.05) / (Lb + 0.05);

    return Cw < Cb ? 'black' : 'white';
  }
  return 'white';
};
