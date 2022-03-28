import React, { useContext } from 'react';
import { ThemeContext } from '../../ThemeContext';
import { markdownHighlighter, markdownHighlighterText, markdownCopyButtonStyle } from './MarkdownComponents.styles';
import IconButton from '../IconButton/IconButton';
import { TextUtilitiesService } from '../../utils/textUtilities';
import { WorkerRuntimeLanguages } from '../../utils/CommonConstants';

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

export interface StackInstructionsProps {
  customStack?: boolean;
  stack?: string;
}

export const StackInstructions: React.FC<StackInstructionsProps> = props => {
  const { customStack, stack } = props;

  const isCustomStack = () => {
    return !!customStack && !!stack && stack.toLowerCase() === WorkerRuntimeLanguages.custom;
  };

  return isCustomStack() ? <div>{props.children}</div> : <></>;
};

export interface SlotComponentProps {
  slotName?: string;
}

export const SlotComponent: React.FC<SlotComponentProps> = props => {
  const { slotName } = props;

  const isSlot = () => {
    return !!slotName;
  };

  return isSlot() ? <>{props.children}</> : <></>;
};
