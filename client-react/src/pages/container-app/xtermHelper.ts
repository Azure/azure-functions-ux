import { Terminal } from 'xterm/lib/xterm';

export interface xtermDimensions {
  rows: number;
  cols: number;
}

export function getTerminalFallbackDimensions(width: number, height: number): xtermDimensions {
  return {
    cols: Math.floor(width / 9 - 0.5) - 2,
    rows: Math.floor(height / 17 - 0.5),
  };
}

export function getTerminalDimensions(width: number, height: number, terminal?: Terminal): xtermDimensions {
  if (!!terminal?.element) {
    const core = (terminal as any)._core;
    const { actualCellWidth, actualCellHeight } = core?._renderService?.dimensions || {};

    if (!!actualCellWidth && !!actualCellHeight) {
      const { paddingTop, paddingBottom, paddingLeft, paddingRight } = window.getComputedStyle(terminal.element);
      const availableHeight = height - parseInt(paddingTop) - parseInt(paddingBottom);
      const availableWidth = width - parseInt(paddingLeft) - parseInt(paddingRight) - core?.viewport?.scrollBarWidth;

      const dimensions = {
        cols: Math.floor(availableWidth / actualCellWidth),
        rows: Math.floor(availableHeight / actualCellHeight),
      };

      const [minCols, minRows] = [2, 1];
      if (dimensions.cols > minCols && dimensions.rows > minRows) {
        return dimensions;
      }
    }
  }

  return getTerminalFallbackDimensions(width, height);
}
