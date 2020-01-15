import { style } from 'typestyle';
export const editorStyle = (height: string) =>
  style({
    height,
    overflow: 'hidden',
  });

export const disabledEditorStyle = style({
  opacity: 0.4,
  pointerEvents: 'none',
});
