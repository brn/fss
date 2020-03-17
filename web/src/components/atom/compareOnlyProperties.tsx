/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import React from 'react';

export const compare = (p: any, np: any) => {
  const keysA = Object.keys(p);
  const keysB = Object.keys(np);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every((keyA, i) => {
    const typeA = typeof p[keyA];
    const typeB = typeof np[keysB[i]];
    if (typeA !== typeB) {
      return false;
    }
    if (typeof typeA !== 'function') {
      return p[keyA] == np[keysB[i]];
    }
    return true;
  });
};

export const compareOnlyProperties = <T,>(
  component: React.FunctionComponent<T>,
): React.MemoExoticComponent<React.FunctionComponent<T>> => {
  return React.memo(component, compare);
};
