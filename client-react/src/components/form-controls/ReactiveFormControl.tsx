import { Label, Link, Stack, TooltipHost, TooltipOverflowMode } from 'office-ui-fabric-react';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { style } from 'typestyle';
import { ReactComponent as InfoSvg } from '../../images/Common/Info.svg';
import { dirtyElementStyle } from '../../pages/app/app-settings/AppSettings.styles';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';
import { InfoTooltip } from '../InfoTooltip/InfoTooltip';
import UpsellIcon from '../TooltipIcons/UpsellIcon';
import IconButton from '../IconButton/IconButton';
import { TextUtilitiesService } from '../../utils/textUtilities';
import {
  controlContainerStyle,
  formLabelStyle,
  formStackStyle,
  hostStyle,
  infoMessageStyle,
  learnMoreLinkStyle,
  tooltipStyle,
  upsellIconStyle,
  stackControlStyle,
  copyButtonStyle,
} from './formControl.override.styles';

export enum Layout {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

interface ReactiveFormControlProps {
  children: JSX.Element;
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label?: string;
  learnMoreLink?: string;
  dirty?: boolean;
  formControlClassName?: string;
  customLabelClassName?: string;
  layout?: Layout;
  mouseOverToolTip?: string;
  required?: boolean;
  multiline?: boolean;
  pushContentRight?: boolean;
  copyValue?: string;
}

const ReactiveFormControl = (props: ReactiveFormControlProps) => {
  const {
    upsellMessage,
    label,
    infoBubbleMessage,
    learnMoreLink,
    dirty,
    formControlClassName,
    customLabelClassName,
    layout,
    children,
    id,
    mouseOverToolTip,
    required,
    multiline,
    pushContentRight,
    copyValue,
  } = props;

  const { width } = useWindowSize();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const [copied, setCopied] = useState(false);
  const fullPage = width > 1000;
  const horizontal = layout ? layout !== Layout.Vertical : fullPage;

  const copyToClipboard = (event: React.MouseEvent<any>) => {
    if (!!event) {
      event.stopPropagation();
    }
    TextUtilitiesService.copyContentToClipboard(copyValue || '');
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
    <Stack
      horizontal={horizontal}
      className={`${!!formControlClassName ? formControlClassName : ''} ${controlContainerStyle(!!upsellMessage, fullPage)}`}>
      {(label || (pushContentRight && fullPage)) && (
        <Stack horizontal className={formStackStyle(!!upsellMessage, fullPage)}>
          {upsellMessage && (
            <div className={upsellIconStyle}>
              <UpsellIcon upsellMessage={upsellMessage} />
            </div>
          )}
          <Label
            className={`${!!customLabelClassName ? customLabelClassName : ''} ${formLabelStyle(!!upsellMessage, fullPage)} ${
              dirty ? dirtyElementStyle(theme, true) : ''
            }`}
            id={`${id}-label`}>
            <TooltipHost overflowMode={TooltipOverflowMode.Self} content={label} hostClassName={hostStyle(multiline)} styles={tooltipStyle}>
              {label}
            </TooltipHost>
            {getRequiredIcon(theme, required)}
            {getMouseOverToolTip(`${children.props.id}-tooltip`, mouseOverToolTip)}
          </Label>
        </Stack>
      )}
      <Stack verticalAlign="center" className={stackControlStyle()}>
        {children}
        {infoBubbleMessage && (
          <div className={infoMessageStyle()}>
            <Stack horizontal verticalAlign="center" disableShrink={true}>
              <InfoSvg
                className={style({
                  paddingRight: '5px',
                })}
              />
              <div
                className={style({
                  width: 'fit-content',
                })}>
                <span id={`${id}-infobubble`}>{`${infoBubbleMessage} `}</span>
                {learnMoreLink && (
                  <Link
                    id={`${id}-learnmore`}
                    href={learnMoreLink}
                    target="_blank"
                    className={learnMoreLinkStyle}
                    aria-labelledby={`${id}-infobubble ${id}-learnmore`}>
                    {t('learnMore')}
                  </Link>
                )}
              </div>
            </Stack>
          </div>
        )}
      </Stack>
      <Stack gap={0} horizontalAlign="start">
        {copyValue && (
          <TooltipHost
            content={getCopiedLabel()}
            calloutProps={{ gapSpace: 0 }}
            onTooltipToggle={isVisible => changeCopiedLabel(isVisible)}>
            <IconButton
              id={`${id}-copy-button`}
              iconProps={{ iconName: 'Copy', styles: copyButtonStyle }}
              onClick={copyToClipboard}
              ariaLabel={getCopiedLabel()}
            />
          </TooltipHost>
        )}
      </Stack>
    </Stack>
  );
};

const getRequiredIcon = (theme: ThemeExtended, required?: boolean) => {
  if (required) {
    return (
      <span
        className={style({
          fontWeight: 'bold',
          color: theme.palette.red,
          marginLeft: '2px',
        })}>
        *
      </span>
    );
  }
};

const getMouseOverToolTip = (id: string, content?: string) => {
  if (content) {
    return <InfoTooltip id={id} content={content} />;
  }
};

export default ReactiveFormControl;
