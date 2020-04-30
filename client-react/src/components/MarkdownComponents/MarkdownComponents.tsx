import React, { useContext } from 'react';
import { ThemeContext } from '../../ThemeContext';
import { markdownHighlighter, markdownHighlighterText, markdownCopyButtonStyle } from './MarkdownComponents.styles';
import IconButton from '../IconButton/IconButton';
import { TextUtilitiesService } from '../../utils/textUtilities';

export const MarkdownHighlighter: React.FC<{}> = props => {
  const theme = useContext(ThemeContext);
  const copyToClipboard = () => {
    TextUtilitiesService.copyContentToClipboard((props.children as string) || '');
  };

  return (
    <div className={markdownHighlighter()}>
      <span className={markdownHighlighterText(theme)}>{props.children}</span>
      <IconButton className={markdownCopyButtonStyle(theme)} iconProps={{ iconName: 'Copy' }} onClick={copyToClipboard} />
    </div>
  );
};
