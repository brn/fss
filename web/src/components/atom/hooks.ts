/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import React, { useState, useRef, useEffect } from 'react';
import uuid from 'uuid';

export const useRefState = <T>(
  initialValue: T,
): [{ current: T }, (value: T) => void] => {
  const [value, update] = useState(initialValue);
  const ref = useRef(value);

  return [
    ref,
    (value: T) => {
      ref.current = value;
      update(value);
    },
  ];
};

export const useLabel = (
  rootRef: React.RefObject<HTMLElement | null | undefined>,
  labelRef?: React.RefObject<HTMLLabelElement | null | undefined>,
) => {
  useEffect(() => {
    if (labelRef && labelRef.current && rootRef.current) {
      if (!rootRef.current.id) {
        rootRef.current.id = uuid.v4();
      }
      if (!labelRef.current.id) {
        labelRef.current.id = uuid.v4();
        labelRef.current.htmlFor = rootRef.current.id;
      }
      (rootRef.current as any)['aria-labelledby'] = labelRef.current.id;
    }
  }, [labelRef ? labelRef.current : false, rootRef.current]);
};
