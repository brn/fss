/**
 * @fileOverview
 * @name Pagenator.tsx
 * @author Taketoshi Aono
 * @license
 */

import React from 'react';
import styled, { StyledComponent } from '@emotion/styled';
import { css } from '@emotion/core';
import { compareOnlyProperties } from '../atom/compareOnlyProperties';
import { regularTextStyle } from '../atom/Text';

const pagenationButtonStyle = (isSelected?: boolean) => css`
  border: 0px;
  padding: 10px 20px;
  background: ${isSelected ? '#EEEEFF' : '#FFF'};
  transition: all 0.3s;
  ${regularTextStyle};
`;

const PagenationButtonElement = styled.button<{ isSelected?: boolean }>`
  ${p => pagenationButtonStyle(p.isSelected)};
  cursor: pointer;
  outline: none;
  border-radius: 100px;
  :hover {
    background: #ddd;
  }
  :focus {
    position: relative;
    z-index: 1;
    box-shadow: 0px 0px 4px rgba(0, 0, 255, 0.7);
  }
`;
type PagenationButtonProps = (typeof PagenationButtonElement extends StyledComponent<
  infer U,
  infer V,
  infer W
>
  ? U & V & W
  : never) & { children: React.ReactChild };
const PagenationButton = ({ children, ...rest }: PagenationButtonProps) => {
  return (
    <PagenationButtonElement
      {...rest}
      className="e2e__pagenation_button"
      tabIndex={0}
    >
      {children}
    </PagenationButtonElement>
  );
};

const PagenationBetweenElement = styled.span`
  ${pagenationButtonStyle()};
`;

const PagenatorContainerElement = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const BetweenButton = React.memo(
  () => <PagenationBetweenElement>...</PagenationBetweenElement>,
  () => true,
);

const RANGE = 3;

export const Paginator = compareOnlyProperties(
  ({
    currentPage,
    onPageChange,
    allPageCount,
  }: {
    currentPage: number;
    onPageChange(next: number): void;
    allPageCount: number;
  }) => {
    const renderedPages = [...Array(RANGE * 2 + 1).keys()]
      .map(i => currentPage - RANGE + i)
      .filter(i => i > 0 && i <= allPageCount);

    const showStart = currentPage - RANGE > 1;
    const showEnd = currentPage + RANGE < allPageCount;

    return (
      <PagenatorContainerElement className="e2e__pagenator">
        {showStart && (
          <>
            <PagenationButton onClick={() => onPageChange(1)}>
              1
            </PagenationButton>
            <BetweenButton />
          </>
        )}
        {renderedPages.map(page => (
          <PagenationButton
            key={page}
            onClick={() => onPageChange(page)}
            isSelected={currentPage === page}
          >
            {page}
          </PagenationButton>
        ))}
        {showEnd && (
          <>
            <BetweenButton />
            <PagenationButton onClick={() => onPageChange(allPageCount)}>
              {allPageCount}
            </PagenationButton>
          </>
        )}
      </PagenatorContainerElement>
    );
  },
);
