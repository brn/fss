/**
 * @fileOverview
 * @name resetStyle.ts
 * @author Taketoshi Aono
 * @license
 */

import { css } from '@emotion/core';

export const resetStyle = css`
  @import url('https://fonts.googleapis.com/css?family=Galada&display=swap');
  /* CSS Remedy */
  *,
  ::after,
  ::before {
    box-sizing: border-box;
  }
  html {
    line-sizing: normal;
  }
  body {
    margin: 0;
  }
  h1 {
    font-size: 2rem;
  }
  h2 {
    font-size: 1.5rem;
  }
  h3 {
    font-size: 1.17rem;
  }
  h4 {
    font-size: 1rem;
  }
  h5 {
    font-size: 0.83rem;
  }
  h6 {
    font-size: 0.67rem;
  }
  h1 {
    margin: 0.67em 0;
  }
  pre {
    white-space: pre-wrap;
  }
  hr {
    border-style: solid;
    border-width: 1px 0 0;
    color: inherit;
    height: 0;
    overflow: visible;
  }
  audio,
  canvas,
  embed,
  iframe,
  img,
  object,
  svg,
  video {
    display: block;
    vertical-align: middle;
    max-width: 100%;
  }
  canvas,
  img,
  svg,
  video {
    height: auto;
  }
  audio {
    width: 100%;
  }
  img {
    border-style: none;
  }
  svg {
    overflow: hidden;
  }
  article,
  aside,
  figcaption,
  figure,
  footer,
  header,
  hgroup,
  main,
  nav,
  section {
    display: block;
  }
  [type='checkbox'],
  [type='radio'] {
    box-sizing: border-box;
    padding: 0;
  }
`;
