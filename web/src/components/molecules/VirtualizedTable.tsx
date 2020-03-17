/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import { Tooltip } from '../atom/Tooltip';
import React, { useRef, useEffect } from 'react';
import {
  defaultTableRowRenderer,
  AutoSizer,
  Column,
  SortDirectionType,
  Table,
  TableRowProps,
  TableCellRenderer,
  TableHeaderRenderer,
} from 'react-virtualized';
import 'react-virtualized/styles.css';
import styled from '@emotion/styled';
import { v4 } from 'uuid';
import { scrollbarStyle, chooseTextColor } from '../atom/styles';
import { skeletonAnimationStyle } from '../atom/styles';
import { compareOnlyProperties } from '../atom/compareOnlyProperties';
import { useRefState } from '../atom/hooks';
import { regularTextStyle } from '../atom/Text';
import { Icon } from '../atom/Icon';

export interface VirtualizedTableColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  width?: number;
  header?: TableHeaderRenderer;
  render?: TableCellRenderer;
  map?(v: string): string;
}

export interface VirtualizedTableComponentProps {
  rowHeight: number;
  headerHeight?: number;
  selectedIndex?: number;
  keySet: VirtualizedTableColumnConfig[];
  model: any[];
  backgroundColor?: string;
  floatingItem?: React.ReactNode;
  loading?: boolean;
  className?: string;
  padding?: number;
  onRowClick?(index: number): void;
  onSort?(a: { sortDirection: SortDirectionType; sortBy: string }): void;
}

enum SortType {
  INACTIVE = 0,
  ASCENDING = 1,
  DESCENDING,
}

const DEFAULT_COLUMN_WIDTH = 3000;

const sortStateInactiveHoverStyle = (p: { sortState: SortType }) => `
  ${p.sortState === SortType.INACTIVE ? 'color: #0066FF !important' : ''};
`;

const colorStyle = (p: { sortDirection: SortDirectionType | 'INACTIVE' }) => `
  color: ${p.sortDirection === 'INACTIVE' ? '#AAA' : '#ff9900'} !important;
`;

const TableHeaderCellSortIcon = styled.div<{
  sortDirection: SortDirectionType | 'INACTIVE';
}>(
  p => `
  ${colorStyle(p)};
  transition: all 0.2s !important;
  display: inline-block;
  `,
);

const TableRoot = styled(Table)<{
  backgroundColor: string;
}>(
  p => `
  border-radius: 8px;
  position: relative;
  background: ${p.backgroundColor};
  .ReactVirtualized__Table__row {
    cursor: pointer;
    transition: all 0.2s;
    ${regularTextStyle};
    padding-right: 0px !important;
    background: p.backgroundColor;
    color: ${chooseTextColor(p.backgroundColor)};
    &:hover {
      background: #eee !important;
    }
    outline: none;
    :focus {
      position: relative;
      z-index: 1;
      box-shadow: 0px 0px 4px rgba(0, 0, 255, 0.5);
    }
  }
  .ReactVirtualized__Table__headerColumn {
    outline: none;
    :focus {
      position: relative;
      z-index: 1;
      box-shadow: 0px 0px 4px rgba(0, 0, 255, 0.5);
    }
  }
  .ReactVirtualized__Table__headerRow {
    padding-right: 0px !important;
    border-bottom: 1px solid #DDD;
    background: ${p.backgroundColor};
    color: ${chooseTextColor(p.backgroundColor)};
    border-radius: 8px 8px 0 0;
    ${regularTextStyle};
  }
  .ReactVirtualized__Table__Grid {
    transition: all 0.2s;
    border-radius: 0px 0px 4px 4px;
  }
  .ReactVirtualized__Grid {
    padding-right: 0px !important;
    ${scrollbarStyle};
  }
  .ReactVirtualized__Table__row__selected {
    background: #00CCFF;
    &:hover {
      background: #00CCFF;
    }
  }
  `,
);

const SkeltonBarElement = styled.div`
  min-width: 50px;
  height: 20px;
  background: #ccc;
  border-radius: 4px;
  ${skeletonAnimationStyle};
`;
const MINIMUM_VISIBLE_ELEMENT_COUNT = 10;

export const VirtualizedTableComponent = compareOnlyProperties(
  ({
    selectedIndex = -1,
    rowHeight,
    keySet,
    model,
    loading,
    headerHeight,
    className,
    floatingItem,
    backgroundColor = '#FFFFFF',
    onRowClick,
    onSort,
  }: VirtualizedTableComponentProps) => {
    const [sortState, updateSortState] = useRefState({
      sortDirection: 'ASC',
      sortBy: '',
    });
    const skeltonsModel = useRef<any[]>([]);
    const renderCell = (
      render?: TableCellRenderer,
      map?: (v: string) => string,
    ): TableCellRenderer => ({ cellData, ...args }) => {
      const data = map ? map(cellData) : cellData;
      const renderWithTooltip = (children: any) => {
        return data ? (
          <Tooltip
            margin="15px 0 0 0"
            label={data}
            onGetWidth={el => {
              const base = el.clientWidth;
              const parent = el.parentElement?.clientWidth || 0;
              return base > parent ? parent : base;
            }}
          >
            {children}
          </Tooltip>
        ) : (
          children
        );
      };

      return render
        ? renderWithTooltip(render({ cellData, ...args }))
        : renderWithTooltip(
            <span style={{ display: 'inline-block' }}>{data}</span>,
          );
    };

    useEffect(() => {
      for (let i = 0; i < MINIMUM_VISIBLE_ELEMENT_COUNT; i++) {
        const d: { [key: string]: string } = {};
        keySet.forEach(({ key }: { key: string }) => (d[key] = v4()));
        skeltonsModel.current.push(d);
      }
    }, []);

    const renderModel = loading ? skeltonsModel.current : model;

    const headerRendererGen: (
      sortable: boolean,
    ) => TableHeaderRenderer | undefined = sortable =>
      sortable
        ? ({ label, sortBy, sortDirection, dataKey }) => {
            const sortType =
              dataKey === sortBy ? sortDirection || 'ASC' : 'INACTIVE';
            return (
              <div>
                <div>
                  <TableHeaderCellSortIcon sortDirection={sortType}>
                    <Icon name="CIRCLE_ARROW" />
                  </TableHeaderCellSortIcon>
                  {label}
                </div>
              </div>
            );
          }
        : undefined;

    const realHeaderHeight = headerHeight || rowHeight;
    const realHeight = loading
      ? MINIMUM_VISIBLE_ELEMENT_COUNT * rowHeight
      : rowHeight * renderModel.length + realHeaderHeight;

    return (
      <AutoSizer>
        {({ width, height }) => {
          const tableHeight = realHeight > height ? height : realHeight;
          return (
            <div style={{ position: 'relative', height: tableHeight, width }}>
              {floatingItem}
              <TableRoot
                backgroundColor={backgroundColor}
                style={{ width }}
                height={tableHeight}
                headerHeight={realHeaderHeight}
                width={width}
                rowCount={renderModel.length}
                rowHeight={rowHeight}
                rowRenderer={(a: TableRowProps) => {
                  return defaultTableRowRenderer({
                    ...a,
                    className:
                      a.index === selectedIndex
                        ? `${a.className} ReactVirtualized__Table__row__selected`
                        : a.className,
                  });
                }}
                rowGetter={(info: { index: number }) => renderModel[info.index]}
                onRowClick={({ index }: { index: number }) => {
                  onRowClick && onRowClick(index);
                }}
                sort={({
                  sortDirection,
                  sortBy,
                }: {
                  sortDirection: SortDirectionType;
                  sortBy: string;
                }) => {
                  if (
                    keySet.some(({ key, sortable }) => {
                      if (key === sortBy) {
                        return !!sortable;
                      }
                      return false;
                    }) &&
                    onSort
                  ) {
                    updateSortState({ sortDirection, sortBy });
                    onSort({ sortDirection, sortBy });
                  }
                }}
                sortBy={sortState.current.sortBy}
                sortDirection={sortState.current.sortDirection}
                className={className}
              >
                {keySet.map(
                  ({ key, label, sortable, render, map, header, width }) => {
                    return (
                      <Column
                        className={`e2e__virtulized-table-colum__${key}`}
                        key={key}
                        headerRenderer={
                          header ? header : headerRendererGen(!!sortable)
                        }
                        defaultSortDirection="ASC"
                        dataKey={key}
                        label={label}
                        width={width || DEFAULT_COLUMN_WIDTH}
                        cellRenderer={
                          loading
                            ? () => <SkeltonBarElement />
                            : renderCell(render, map)
                        }
                      />
                    );
                  },
                )}
              </TableRoot>
            </div>
          );
        }}
      </AutoSizer>
    );
  },
);

VirtualizedTableComponent.displayName = 'VirtualizedTableComponent';
