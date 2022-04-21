import React, { FC, useCallback, useContext, useState } from 'react';
import { TextField as OfficeTextField, ITextFieldProps } from '@fluentui/react';
import ReactiveFormControl from './ReactiveFormControl';
import { useWindowSize } from 'react-use';
import { ThemeContext } from '../../ThemeContext';
import { textFieldStyleOverrides, copyButtonStyle } from './formControl.override.styles';
import { TooltipHost, Stack, IButton } from '@fluentui/react';
import IconButton from '../IconButton/IconButton';
import { useTranslation } from 'react-i18next';
import { TextUtilitiesService } from '../../utils/textUtilities';
import { CustomTextFieldProps } from './TextField';

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
    required,
    ...rest
  } = props;
  const { width } = useWindowSize();
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const fullpage = width > 1000;

  const [copied, setCopied] = useState(false);
  const [copyButtonRef, setCopyButtonRef] = useState<IButton | undefined>(undefined);

  const copyToClipboard = (e: React.MouseEvent<any>) => {
    e?.stopPropagation();
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
      </>
    );
  };

  const getTextFieldStyles = useCallback(() => {
    return styles ?? textFieldStyleOverrides(theme, fullpage, widthOverride);
  }, [styles, theme, fullpage, widthOverride]);

  const getTextFieldProps = (): ITextFieldProps => {
    const textFieldProps: ITextFieldProps = {
      id,
      onChange,
      onBlur,
      errorMessage,
      onRenderSuffix,
      tabIndex: 0,
      styles: getTextFieldStyles(),
      required: false, // ReactiveFormControl will handle displaying required
      // // NOTE(michinoy): even though we are handling the required display marker at
      // // the field level, for a11y we need to have the aria-required tag set.
      'aria-labelledby': `${id}-label`,
      'aria-required': !!required,
      // NOTE(krmitta): This is only used when the type is set as 'password'
      canRevealPassword: true,
    };

    const textFieldPropsWithValueProp = { ...textFieldProps, value: value };
    const testFieldPropsWithDefaultValueProp = { ...textFieldProps, defaultValue: defaultValue };

    if (value) {
      return textFieldPropsWithValueProp;
    }
    if (defaultValue) {
      return testFieldPropsWithDefaultValueProp;
    }
    return textFieldPropsWithValueProp;
  };

  return (
    <ReactiveFormControl {...props}>
      <Stack horizontal verticalAlign="center">
        <OfficeTextField {...getTextFieldProps()} {...rest} />
        {additionalControls}
      </Stack>
    </ReactiveFormControl>
  );
};
export default TextFieldNoFormik;
