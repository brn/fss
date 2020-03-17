/**
 * @fileOverview
 * @name ModalDialog.tsx
 * @author Taketoshi Aono
 * @license
 */

import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { xxlargeTextStyle } from '../atom/Text';
import { compareOnlyProperties } from '../atom/compareOnlyProperties';

const ModalElement = styled.div`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;
const ModalDialogContainerElement = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 3;
`;
const ModalDialogElement = styled(motion.section)`
  z-index: 2;
  min-width: 100px;
  min-height: 100px;
  z-index: 3;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 0.6px 0.5px -9px rgba(0, 0, 0, 0.013),
    0 1.4px 1px -9px rgba(0, 0, 0, 0.019),
    0 2.3px 1.7px -9px rgba(0, 0, 0, 0.023),
    0 3.5px 2.5px -9px rgba(0, 0, 0, 0.027),
    0 5px 3.6px -9px rgba(0, 0, 0, 0.03),
    0 7.1px 5.1px -9px rgba(0, 0, 0, 0.033),
    0 10.1px 7.3px -9px rgba(0, 0, 0, 0.037),
    0 14.6px 10.6px -9px rgba(0, 0, 0, 0.041),
    0 22.5px 16.3px -9px rgba(0, 0, 0, 0.047),
    0 40px 29px -9px rgba(0, 0, 0, 0.06);
`;

const ModalTitleElement = styled.h3`
  ${xxlargeTextStyle};
`;

const ModalContentElement = styled.div`
  padding: 10px;
`;

const useFocusControl = ({
  visible,
  firstControlRef,
  rootRef,
}: {
  visible: boolean;
  firstControlRef?: React.RefObject<HTMLElement | undefined>;
  rootRef: React.RefObject<HTMLElement | undefined>;
}) => {
  const previousActive = useRef<Element | null>(null);
  useEffect(() => {
    if (visible) {
      previousActive.current = document.activeElement;
      if (firstControlRef && firstControlRef.current) {
        firstControlRef.current.focus();
      }
    } else {
      if (previousActive.current) {
        const el = previousActive.current as any;
        if (el.focus) {
          el.focus();
        } else {
          window.focus();
        }
      } else {
        window.focus();
      }
    }

    const handleFocus = (e: FocusEvent) => {
      if (
        visible &&
        rootRef.current &&
        !rootRef.current.contains(e.target! as Node)
      ) {
        const el = (rootRef.current.querySelector(
          `:not([tabindex='-1'])[tabindex]`,
        ) as unknown) as HTMLElement;
        if (el) {
          el.focus();
        }
      }
    };
    document.documentElement.addEventListener('focus', handleFocus, true);

    return () =>
      document.documentElement.removeEventListener('focus', handleFocus);
  }, [visible, firstControlRef ? firstControlRef.current : false]);
};

export const ModalDialog = compareOnlyProperties(
  ({
    children,
    firstControlRef,
    visible,
    title,
  }: {
    visible: boolean;
    title: string;
    firstControlRef: React.MutableRefObject<HTMLElement | undefined>;
    children: React.ReactChild;
  }) => {
    const rootRef = useRef<HTMLElement | undefined>();
    useFocusControl({ visible, firstControlRef, rootRef });

    return createPortal(
      <AnimatePresence>
        {visible ? (
          <ModalDialogContainerElement tabIndex={-1}>
            <ModalDialogElement
              key={Date.now()}
              initial={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{
                opacity: 0,
                translateY: -20,
              }}
              transition={{ type: 'tween', duration: 0.3 }}
              ref={rootRef as any}
            >
              <ModalTitleElement>{title}</ModalTitleElement>
              <ModalContentElement>{children}</ModalContentElement>
            </ModalDialogElement>
            {createPortal(<ModalElement />, document.body)}
          </ModalDialogContainerElement>
        ) : null}
      </AnimatePresence>,
      document.body,
    );
  },
);
