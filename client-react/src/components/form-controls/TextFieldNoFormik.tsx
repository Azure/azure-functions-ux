import React, { FC, useContext, useState } from 'react';
import { TextField as OfficeTextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import ReactiveFormControl, { Layout } from './ReactiveFormControl';
import { useWindowSize } from 'react-use';
import { ThemeContext } from '../../ThemeContext';
import { textFieldStyleOverrides, copyButtonStyle } from './formControl.override.styles';
import { TooltipHost, Stack, IButton } from 'office-ui-fabric-react';
import IconButton from '../IconButton/IconButton';
import { useTranslation } from 'react-i18next';
import { TextUtilitiesService } from '../../utils/textUtilities';
import { CommonConstants } from '../../utils/CommonConstants';

interface CustomTextFieldProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label?: string;
  learnMoreLink?: string;
  dirty?: boolean;
  widthOverride?: string;
  copyButton?: boolean;
  formControlClassName?: string;
  additionalControls?: JSX.Element[];
  layout?: Layout;
  hideShowButton?: {
    onButtonClick?: (hidden: boolean) => void;
  };
}
const TextFieldNoFormik: FC<ITextFieldProps & CustomTextFieldProps> = props => {
  const {
    value,
    defaultValue,
    onChange,
    onBlur,
    errorMessage,
    label,
    widthOverride,
    styles,
    id,
    copyButton,
    additionalControls,
    hideShowButton,
    required,
    ...rest
  } = props;
  const { width } = useWindowSize();
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const fullpage = width > 1000;

  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(!!hideShowButton);
  const [copyButtonRef, setCopyButtonRef] = useState<IButton | undefined>(undefined);

  const copyToClipboard = (e: React.MouseEvent<any>) => {
    if (!!e) {
      e.stopPropagation();
    }
    TextUtilitiesService.copyContentToClipboard(value || '', copyButtonRef);
    setCopied(true);
  };

  const getCopiedLabel = () => {
    return copied ? t('copypre_copied') : t('copypre_copyClipboard');
  };

  const changeCopiedLabel = isToolTipVisible => {
    if (copied && !isToolTipVisible) {
      setCopied(false);
    }
  };

  const getHideShowButtonLabel = () => {
    return hidden ? t('clickToShowValue') : t('clickToHideValue');
  };

  const onHideShowButtonClick = (e: React.MouseEvent<any>) => {
    if (!!e) {
      e.stopPropagation();
    }
    if (hideShowButton && hideShowButton.onButtonClick) {
      hideShowButton.onButtonClick(!hidden);
    }
    setHidden(!hidden);
  };

  const onRenderSuffix = () => {
    return (
      <>
        {copyButton && (
          <TooltipHost
            content={getCopiedLabel()}
            calloutProps={{ gapSpace: 0 }}
            onTooltipToggle={isVisible => changeCopiedLabel(isVisible)}>
            <IconButton
              id={`${id}-copy-button`}
              iconProps={{ iconName: 'Copy', styles: copyButtonStyle }}
              onClick={copyToClipboard}
              ariaLabel={getCopiedLabel()}
              componentRef={ref => ref && setCopyButtonRef(ref)}
            />
          </TooltipHost>
        )}
        {hideShowButton && (
          <TooltipHost content={getHideShowButtonLabel()} calloutProps={{ gapSpace: 0 }}>
            <IconButton
              id={`${id}-hide-show-button`}
              iconProps={{ iconName: hidden ? 'RedEye' : 'Hide', styles: copyButtonStyle }}
              onClick={onHideShowButtonClick}
              ariaLabel={getHideShowButtonLabel()}
            />
          </TooltipHost>
        )}
      </>
    );
  };

  const getTextFieldProps = (): ITextFieldProps => {
    const textFieldProps: ITextFieldProps = {
      id,
      onChange,
      onBlur,
      errorMessage,
      onRenderSuffix,
      tabIndex: 0,
      styles: textFieldStyleOverrides(theme, fullpage, widthOverride),
      required: false, // ReactiveFormControl will handle displaying required
      // // NOTE(michinoy): even though we are handling the required display marker at
      // // the field level, for a11y we need to have the aria-required tag set.
      'aria-labelledby': `${id}-label`,
      'aria-required': !!required,
    };

    return !!defaultValue ? { ...textFieldProps, defaultValue } : { ...textFieldProps, value: value || '' };
  };

  const valueProps = hideShowButton && hidden ? CommonConstants.DefaultHiddenValue : getTextFieldProps();

  return (
    <ReactiveFormControl {...props}>
      <Stack horizontal verticalAlign="center">
        <OfficeTextField {...valueProps} {...rest} />
        {additionalControls}
      </Stack>
    </ReactiveFormControl>
  );
};
export default TextFieldNoFormik;
