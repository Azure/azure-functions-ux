import React from 'react';
import { FocusTrapCallout, FocusZone, Stack, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import { focusTrapCalloutStyle } from './CustomCallout.styles';

export interface CustomFocusTrapCalloutProps {
  target: string; // Show reference either target elements ID ('#id') or Class name ('.class')
  onDismissFunction: () => void;
  setInitialFocus: boolean;
  hidden: boolean;
  title: string;
  description: string;
  primaryButtonTitle: string;
  primaryButtonFunction: () => void;
  defaultButtonTitle: string;
  defaultButtonFunction: () => void;
}

const CustomFocusTrapCallout: React.FC<CustomFocusTrapCalloutProps> = props => {
  const {
    target,
    onDismissFunction,
    setInitialFocus,
    hidden,
    title,
    description,
    primaryButtonTitle,
    primaryButtonFunction,
    defaultButtonTitle,
    defaultButtonFunction,
  } = props;

  return (
    <FocusTrapCallout
      role="alertdialog"
      className={focusTrapCalloutStyle.dialog}
      gapSpace={0}
      target={target}
      onDismiss={onDismissFunction}
      setInitialFocus={setInitialFocus}
      hidden={hidden}>
      <div className={focusTrapCalloutStyle.header}>
        <p className={focusTrapCalloutStyle.title}>{title}</p>
      </div>
      <div className={focusTrapCalloutStyle.inner}>
        <div>
          <p className={focusTrapCalloutStyle.subtext}>{description}</p>
        </div>
      </div>

      <FocusZone>
        <Stack className={focusTrapCalloutStyle.buttons} gap={8} horizontal>
          <PrimaryButton onClick={primaryButtonFunction}>{primaryButtonTitle}</PrimaryButton>
          <DefaultButton onClick={defaultButtonFunction}>{defaultButtonTitle}</DefaultButton>
        </Stack>
      </FocusZone>
    </FocusTrapCallout>
  );
};

export default CustomFocusTrapCallout;
