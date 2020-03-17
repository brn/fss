/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import React from 'react';
import styled from '@emotion/styled';
import { scrollbarStyle } from '../atom/styles';
import { motion } from 'framer-motion';

const LayoutContainerElement = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction column;
  background: #F6F6F6;
`;

const HeaderContainerElement = styled(motion.div)`
  height: 70px;
  background: #fff;
  box-shadow: 0 0.5px 1.4px rgba(0, 0, 0, 0.008),
    0 1.2px 3.1px rgba(0, 0, 0, 0.012), 0 2px 5.2px rgba(0, 0, 0, 0.015),
    0 3px 7.8px rgba(0, 0, 0, 0.018), 0 4.4px 11.3px rgba(0, 0, 0, 0.02),
    0 6.2px 15.9px rgba(0, 0, 0, 0.022), 0 8.8px 22.6px rgba(0, 0, 0, 0.025),
    0 12.8px 32.9px rgba(0, 0, 0, 0.028), 0 19.7px 50.6px rgba(0, 0, 0, 0.032),
    0 35px 90px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 1;
`;

const LayoutInnerContainerElement = styled.main`
  display: flex;
  width: 100%;
  height: 100%;
`;

const LayoutContentContainerElement = styled.div`
  width: calc(100vw - 80px);
  height: calc(100vh - 70px);
  overflow: auto;
  ${scrollbarStyle};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutContainerElement>
      <HeaderContainerElement
        initial={{ translateY: -70 }}
        animate={{ translateY: 0 }}
        transition={{ type: 'spring', duration: 0.4 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <div
            style={{
              display: 'flex',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '0 10px',
              width: 500,
              fontSize: 30,
              whiteSpace: 'nowrap',
              fontFamily: "'Galada', cursive",
            }}
          >
            File Storage Service
          </div>
        </div>
      </HeaderContainerElement>
      <LayoutInnerContainerElement>
        <LayoutContentContainerElement>
          {children}
        </LayoutContentContainerElement>
      </LayoutInnerContainerElement>
    </LayoutContainerElement>
  );
};
