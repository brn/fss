/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import React, { useRef, useEffect } from 'react';
import assert from 'assert';
import { css, Global } from '@emotion/core';
import { createPortal } from 'react-dom';
import { smallTextStyle } from './Text';
import uuid from 'uuid';
import { compareOnlyProperties } from './compareOnlyProperties';

const ID = `aim-tooltip-${uuid.v4()}`;
const WHITE_CLASS = `white-${ID}`;
const RIGHT_CLASS = `right-${ID}`;
const LEFT_CLASS = `left-${ID}`;
export const TooltipGlobalStyles = css`
  #${ID} {
    ${smallTextStyle};
    position: absolute;
    display: none;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999999;
    padding: 10px 15px;
    color: #fff;
    border-radius: 8px;
    box-shadow: 0 0.2px 0.2px rgba(0, 0, 0, 0.013),
      0 0.3px 0.3px rgba(0, 0, 0, 0.019), 0 0.6px 0.6px rgba(0, 0, 0, 0.023),
      0 0.9px 0.9px rgba(0, 0, 0, 0.027), 0 1.3px 1.3px rgba(0, 0, 0, 0.03),
      0 1.8px 1.8px rgba(0, 0, 0, 0.033), 0 2.5px 2.5px rgba(0, 0, 0, 0.037),
      0 3.7px 3.7px rgba(0, 0, 0, 0.041), 0 5.6px 5.6px rgba(0, 0, 0, 0.047),
      0 10px 10px rgba(0, 0, 0, 0.06);
    margin: 0px 0px 0px 0px;
    transition: transform 0.1s;
    transform: scale(0);
    transform-origin: 50% 0;
    opacity: 0.8;
    max-width: 50vw;
    backdrop-filter: blur(20px);
    &:before {
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 5px 8.7px 5px;
      border-color: transparent transparent #000000 transparent;
      display: block;
      content: '';
      position: absolute;
      left: 50%;
      top: -8px;
      margin-left: -5px;
      opacity: 0.6;
      backdrop-filter: blur(20px);
    }
  }
  .${WHITE_CLASS} {
    opacity: 1;
    background: #fff !important;
    color: #333 !important;
    &:before {
      background: #fff !important;
    }
  }
  .${RIGHT_CLASS} {
    &:before {
      left: 100% !important;
      margin-left: -16px !important;
    }
  }
  .${LEFT_CLASS} {
    &:before {
      left: 0% !important;
      margin-left: 16px !important;
    }
  }
`;

let GLOBAL_UNIQUE_ONLY_ONE_ID = '';
const FlyweightTooltip = compareOnlyProperties(
  ({
    onMouseEnter,
    onMouseLeave,
  }: {
    onMouseEnter(e: React.MouseEvent<any>): void;
    onMouseLeave(e: React.MouseEvent<any>): void;
  }) => {
    const id = useRef(uuid.v4());
    if (!GLOBAL_UNIQUE_ONLY_ONE_ID) {
      GLOBAL_UNIQUE_ONLY_ONE_ID = id.current;
    }
    useEffect(() => {
      const handler = () => {
        hideTimeoutIds.push(setTimeout(hide, 300));
      };
      document.documentElement.addEventListener('mouseover', handler);
      return () => {
        if (GLOBAL_UNIQUE_ONLY_ONE_ID === id.current) {
          GLOBAL_UNIQUE_ONLY_ONE_ID = '';
        }
        document.documentElement.removeEventListener('mouseover', handler);
      };
    }, []);
    if (GLOBAL_UNIQUE_ONLY_ONE_ID === id.current) {
      return (
        <>
          <Global styles={TooltipGlobalStyles} />
          {createPortal(
            <div
              id={ID}
              onMouseOver={e => onMouseEnter(e)}
              onMouseLeave={e => onMouseLeave(e)}
            ></div>,
            document.body,
          )}
        </>
      );
    }
    return null;
  },
);

const show = ({
  useBrightTheme,
  target,
  useHtml,
  label,
  delay,
  margin,
  timeoutIds,
  onGetWidth,
}: {
  useBrightTheme?: boolean;
  target: Element | null | undefined;
  useHtml?: boolean;
  label: string;
  timeoutIds: any[];
  delay?: number;
  margin?: string;
  onGetWidth?(el: Element): number;
}) => {
  const DEFAULT_TIMEOUT_MS = 800;
  timeoutIds.push(
    window.setTimeout(
      () => {
        const tooltip = document.getElementById(ID);
        if (tooltip && document.documentElement) {
          tooltip.classList.remove(WHITE_CLASS);
          tooltip.classList.remove(RIGHT_CLASS);
          tooltip.classList.remove(LEFT_CLASS);

          if (useBrightTheme) {
            tooltip.classList.add(WHITE_CLASS);
          }
          const el = target;
          if (el && document.body.contains(el)) {
            const rect = el.getBoundingClientRect();
            tooltip[useHtml ? 'innerHTML' : 'textContent'] = label;
            tooltip.style.display = 'block';

            const top =
              rect.top +
              (document.documentElement.scrollTop || document.body.scrollTop) +
              rect.height -
              10;
            const baseElementWidth = onGetWidth
              ? onGetWidth(el)
              : el.clientWidth;

            let left =
              rect.left +
              baseElementWidth / 2 +
              (document.documentElement.scrollLeft ||
                document.body.scrollLeft) -
              tooltip.clientWidth / 2;

            let direction = Direction.CENTER;
            if (
              left + tooltip.clientWidth >
              document.documentElement.clientWidth
            ) {
              tooltip.classList.add(RIGHT_CLASS);
              left -= tooltip.clientWidth / 2;
              direction = Direction.RIGHT;
            } else if (left < 0) {
              tooltip.classList.add(LEFT_CLASS);
              left = rect.left;
              direction = Direction.LEFT;
            }
            let cssText = `top: ${top}px;left: ${left}px;display: block; transform: scale(1); transform-origin: ${
              direction === Direction.LEFT
                ? '0px 0px'
                : direction === Direction.RIGHT
                ? '100% 0'
                : '50% 0'
            };`;
            tooltip.style.display = 'none';
            // Marginが入ってる場合はcssに追加
            if (margin != null) {
              cssText += `margin: ${margin}`;
            }
            tooltip.style.cssText = cssText;
            (tooltip as any)['__visible'] = true;
          }
        }
      },
      delay != null ? delay : DEFAULT_TIMEOUT_MS,
    ),
  );
};

const hide = () => {
  const tooltip = document.getElementById(ID);
  if (tooltip && (tooltip as any)['__visible']) {
    tooltip.style.transform = '';
  }
};

export interface Props {
  margin?: string;
  useHtml?: boolean;
  delay?: number;
  useBrightTheme?: boolean;
  label: string;
  onGetWidth?(node: HTMLElement): number;
}

export interface State {}

const HIDE_TIME_MS = 100;

enum Direction {
  LEFT,
  RIGHT,
  CENTER,
}

const timeoutIds: any[] = [];
const hideTimeoutIds: any[] = [];

export const Tooltip = compareOnlyProperties(
  ({
    children,
    margin,
    useBrightTheme,
    useHtml,
    delay,
    label,
    onGetWidth,
  }: Props & { children: React.ReactChild }) => {
    const target = useRef<HTMLElement | null>(null);
    assert.strictEqual(
      React.Children.count(children),
      1,
      'Tooltip only accept only one child',
    );
    const child: React.ReactElement<any, any> = React.Children.toArray(
      children,
    )[0] as any;
    const isTextNode = typeof child === 'string';
    assert.strictEqual(
      React.isValidElement(child) || isTextNode,
      true,
      `Child of Tooltip must be a valid ReactElement.\nBut got ${child}`,
    );
    const ref = (e: HTMLElement) => {
      if (!isTextNode && typeof child.props.ref === 'function') {
        child.props.ref(e);
      }
      target.current = e;
    };

    useEffect(() => {
      return () => hide();
    }, []);

    const handleMouseOver = (e: React.MouseEvent<any>) => {
      e.stopPropagation();
      clearHide();
      clearDisplay();
      show({
        margin,
        useHtml,
        delay,
        useBrightTheme,
        label,
        target: target.current,
        timeoutIds,
        onGetWidth,
      });
    };

    const handleMouseOut = (e: React.MouseEvent<any>) => {
      e.stopPropagation();
      clearHide();
      clearDisplay();
      if (!document.body.contains(target.current)) {
        return hide();
      }
      hideTimeoutIds.push(
        window.setTimeout(() => {
          clearHide();
          hide();
        }, HIDE_TIME_MS),
      );
    };

    const clearHide = () => {
      hideTimeoutIds.forEach(v => clearTimeout(v));
      hideTimeoutIds.length = 0;
    };

    const clearDisplay = () => {
      timeoutIds.forEach(v => clearTimeout(v));
      timeoutIds.length = 0;
    };

    const onMouseLeave = (e: React.MouseEvent<HTMLElement>) =>
      handleMouseOut(e);
    const onMouseEnter = (e: React.MouseEvent<HTMLElement>) =>
      handleMouseOver(e);

    return (
      <>
        <FlyweightTooltip
          onMouseEnter={e => {
            e.stopPropagation();
            clearHide();
          }}
          onMouseLeave={e => {
            e.stopPropagation();
            clearDisplay();
          }}
        />
        {isTextNode ? (
          <span
            className="tooltip-hover"
            onMouseLeave={onMouseLeave}
            onMouseOver={onMouseEnter}
            ref={ref}
          >
            {child}
          </span>
        ) : (
          React.cloneElement(child, {
            className: `${((child.props as any).className as string) ||
              ''} tooltip-hover`,
            onMouseLeave: child.props.onMouseLeave
              ? (e: React.MouseEvent<HTMLElement>) => {
                  child.props.onMouseLeave(e);
                  onMouseLeave(e);
                }
              : onMouseLeave,
            onMouseOver: child.props.onMouseOver
              ? (e: React.MouseEvent<HTMLElement>) => {
                  child.props.onMouseOver(e);
                  onMouseEnter(e);
                }
              : onMouseEnter,
            ref,
          } as any)
        )}
      </>
    );
  },
);
