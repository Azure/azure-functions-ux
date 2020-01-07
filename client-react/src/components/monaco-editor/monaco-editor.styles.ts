import { style } from 'typestyle';
export const editorStyle = style({
  height: 'calc(100vh - 100px)',
  overflow: 'hidden',
});

export const disabledEditorStyle = style({
  opacity: 0.4,
  pointerEvents: 'none',
});
