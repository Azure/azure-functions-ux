import React, { FC, useContext, useState } from 'react';
import { TextField as OfficeTextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import ReactiveFormControl from './ReactiveFormControl';
import { useWindowSize } from 'react-use';
import { ThemeContext } from '../../ThemeContext';
import { textFieldStyleOverrides, copyButtonStyle } from './formControl.override.styles';
import { TooltipHost } from 'office-ui-fabric-react';
import IconButton from '../IconButton/IconButton';
import { useTranslation } from 'react-i18next';
import { TextUtilitiesService } from '../../utils/textUtilities';

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
}
const TextFieldNoFormik: FC<ITextFieldProps & CustomTextFieldProps> = props => {
  const { value, onChange, onBlur, errorMessage, label, widthOverride, styles, id, copyButton, ...rest } = props;
  const { width } = useWindowSize();
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const fullpage = width > 1000;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    TextUtilitiesService.copyContentToClipboard(value || '');
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

  return (
    <ReactiveFormControl {...props}>
      <OfficeTextField
        id={id}
        aria-labelledby={`${id}-label`}
        value={value || ''}
        tabIndex={0}
        onChange={onChange}
        onBlur={onBlur}
        errorMessage={errorMessage}
        styles={textFieldStyleOverrides(theme, fullpage, widthOverride)}
        {...rest}
      />
      {copyButton && (
        <TooltipHost content={getCopiedLabel()} calloutProps={{ gapSpace: 0 }} onTooltipToggle={isVisible => changeCopiedLabel(isVisible)}>
          <IconButton
            className={copyButtonStyle(theme, fullpage, !!errorMessage)}
            id={`${id}-copy-button`}
            iconProps={{ iconName: 'Copy' }}
            onClick={copyToClipboard}
            ariaLabel={getCopiedLabel()}
          />
        </TooltipHost>
      )}
    </ReactiveFormControl>
  );
};
export default TextFieldNoFormik;
