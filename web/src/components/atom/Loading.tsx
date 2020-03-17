/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

const LoadingDefs = React.memo(
  ({ duration, id }: { duration: number; id: string }) => {
    const TRANSITION = {
      type: 'spring',
      flip: Infinity,
      easings: ['easeOut'],
      duration,
      repeatDelay: 0,
    };
    const C1 = '#0099FF';
    const C2 = '#00FF99';
    const C3 = '#FF9900';
    const C4 = '#CC66FF';
    return (
      <defs>
        <linearGradient id={id} x1="0%" y1="50%">
          <motion.stop
            offset="0%"
            stopColor={C1}
            initial={{ stopColor: C1 }}
            animate={{
              stopColor: [C2, C3, C4],
            }}
            transition={TRANSITION}
          />
          <motion.stop
            offset="25%"
            stopColor={C2}
            initial={{ stopColor: C2 }}
            animate={{
              stopColor: [C3, C4, C1],
            }}
            transition={TRANSITION}
          />
          <motion.stop
            offset="50%"
            stopColor={C3}
            initial={{ stopColor: C3 }}
            animate={{ stopColor: [C4, C1, C2] }}
            transition={TRANSITION}
          />
          <motion.stop
            offset="75%"
            stopColor={C4}
            initial={{ stopColor: C4 }}
            animate={{
              stopColor: [C1, C2, C3],
            }}
            transition={TRANSITION}
          />
          <stop offset="100%" stopColor={C3} />
        </linearGradient>
      </defs>
    );
  },
  () => true,
);

const svgRotate = keyframes`
0% {
  transform: rotate(0deg)
}
100% {
  transform: rotate(360deg)
}
`;
const SVGContainerElement = styled.svg`
  animation: ${svgRotate} 1.5s linear infinite;
`;

const LoadingContainerElement = styled(motion.div)`
  z-index: 1;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Loading = React.memo(
  ({ scale = 1, modal = false }: { scale: number; modal?: boolean }) => {
    const ref = useRef<SVGCircleElement>(null);
    const v = 100 * scale;
    const innerV = v * 0.8;
    const offset = (v - innerV) / 2;
    const r = innerV >>> 1;
    const sw = r * 0.3;
    const dash = v * Math.PI;
    return (
      <LoadingContainerElement
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring' }}
        style={{
          background: modal ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
        }}
        role="progressbar"
      >
        <SVGContainerElement
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${v} ${v}`}
          style={{
            width: v,
            height: v,
          }}
          aria-hidden={true}
        >
          <LoadingDefs duration={0.6} id="g1" />
          <g className="cls-2">
            <motion.circle
              ref={ref}
              cx={r + offset}
              cy={r + offset}
              r={r}
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: dash,
                stroke: 'url(#g1)',
                strokeWidth: sw,
                strokeLinecap: 'round',
              }}
              initial={{
                strokeDashoffset: dash,
              }}
              animate={{
                strokeDashoffset: [
                  dash * 0.95,
                  dash * 0.65,
                  dash * 0.35,
                  dash * 0.15,
                  dash * 0.25,
                  dash * 0.35,
                  dash * 0.45,
                  dash * 0.55,
                  dash * 0.65,
                  dash * 0.75,
                  dash * 0.85,
                  dash * 0.95,
                ],
              }}
              transition={{
                type: 'tween',
                loop: Infinity,
                easings: ['easeIn'],
                duration: 3,
                repeatDelay: 0,
              }}
            />
          </g>
        </SVGContainerElement>
      </LoadingContainerElement>
    );
  },
);
