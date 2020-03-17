/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { xxlargeTextStyle } from '../atom/Text';
import { compareOnlyProperties } from '../atom/compareOnlyProperties';

const CardContainerElement = styled(motion.section)<{ transparent: boolean }>(
  p => `
  display: inline-block;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  :before {
    content: "";
    display: block;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background: ${p.transparent ? 'rgba(255, 255, 255, 0.4)' : '#FFF'};
    z-index: 1;
    border-radius: 8px;
    ${p.transparent ? 'backdrop-filter: blur(12px);' : ''};
  }
box-shadow:
  0 0.6px 0.5px -9px rgba(0, 0, 0, 0.013),
  0 1.4px 1px -9px rgba(0, 0, 0, 0.019),
  0 2.3px 1.7px -9px rgba(0, 0, 0, 0.023),
  0 3.5px 2.5px -9px rgba(0, 0, 0, 0.027),
  0 5px 3.6px -9px rgba(0, 0, 0, 0.03),
  0 7.1px 5.1px -9px rgba(0, 0, 0, 0.033),
  0 10.1px 7.3px -9px rgba(0, 0, 0, 0.037),
  0 14.6px 10.6px -9px rgba(0, 0, 0, 0.041),
  0 22.5px 16.3px -9px rgba(0, 0, 0, 0.047),
  0 40px 29px -9px rgba(0, 0, 0, 0.06);
  `,
);
const CardContentElement = styled.article`
  position: relative;
  z-index: 2;
`;

const CardTitleContainerElement = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 4px solid #eeeeee;
`;
const CardTitleElement = styled.div`
  font-weight: bold;
  color: #222;
  padding: 40px;
  ${xxlargeTextStyle};
`;

export const Card = compareOnlyProperties(
  React.forwardRef(
    (
      {
        children,
        minWidth = 0,
        title = '',
        transparent = false,
        buttons = null,
      }: {
        children: React.ReactNode;
        title?: string;
        minWidth?: string | number;
        transparent?: boolean;
        buttons?: React.ReactNode;
      },
      ref: React.Ref<HTMLElement>,
    ) => {
      return (
        <CardContainerElement
          transparent={transparent}
          initial={{ opacity: 0, translateX: 40 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: 40 }}
          transition={{ type: 'spring', duration: 0.4 }}
          style={{ minWidth }}
          ref={ref}
        >
          <CardContentElement>
            {title ? (
              <CardTitleContainerElement>
                <CardTitleElement>{title}</CardTitleElement>
                <div style={{ marginRight: 40 }}>{buttons}</div>
              </CardTitleContainerElement>
            ) : null}
            {children}
          </CardContentElement>
        </CardContainerElement>
      );
    },
  ),
);
