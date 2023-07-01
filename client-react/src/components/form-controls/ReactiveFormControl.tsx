import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { style } from 'typestyle';

import { IButton } from '@fluentui/react/lib/Button';
import { css, Label, Link, Stack, TooltipHost, TooltipOverflowMode } from '@fluentui/react';

import { ReactComponent as InfoSvg } from '../../images/Common/Info.svg';
import { dirtyElementStyle } from '../../pages/app/app-settings/AppSettings.styles';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';
import { Guid } from '../../utils/Guid';
import { TextUtilitiesService } from '../../utils/textUtilities';
import IconButton from '../IconButton/IconButton';
import { InfoTooltip } from '../InfoTooltip/InfoTooltip';
import UpsellIcon from '../TooltipIcons/UpsellIcon';

import {
  controlContainerStyle,
  copyButtonStyle,
  formLabelStyle,
  formStackStyle,
  hostStyle,
  infoMessageStyle,
  learnMoreLinkStyle,
  stackControlStyle,
  tooltipStyle,
  upsellIconStyle,
} from './formControl.override.styles';

export enum Layout {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

interface ReactiveFormControlProps {
  children: JSX.Element;
  id: string;
  upsellMessage?: string;
  widthLabel?: string;
  infoBubbleMessage?: string;
  label?: string;
  learnMoreLink?: string;
  dirty?: boolean;
  formControlClassName?: string;
  customLabelClassName?: string;
  customLabelStackClassName?: string;
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
    customLabelStackClassName,
    layout,
    children,
    id,
    mouseOverToolTip,
    required,
    multiline,
    pushContentRight,
    copyValue,
    widthLabel,
  } = props;

  const { width } = useWindowSize();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const [copied, setCopied] = useState(false);
  const [copyButtonRef, setCopyButtonRef] = useState<IButton | undefined>(undefined);
  const fullPage = width > 1000;
  const horizontal = layout ? layout !== Layout.Vertical : fullPage;

  const copyToClipboard = useCallback(
    async (event: React.MouseEvent<any>) => {
      event?.stopPropagation();
      await TextUtilitiesService.copyContentToClipboard(copyValue || '', copyButtonRef);
      setCopied(true);
    },
    [copyValue, copyButtonRef]
  );

  const getCopiedLabel = useCallback(() => {
    return copied ? t('copypre_copied') : t('copypre_copyClipboard');
  }, [copied]);

  const getCopiedAriaLabel = useCallback(() => {
    if (label) {
      const copiedAriaLabel = label + ' ' + t('copypre_copied');
      const copyClipboardAriaLabel = label + ' ' + t('copypre_copyClipboard');
      return copied ? copiedAriaLabel : copyClipboardAriaLabel;
    } else {
      return getCopiedLabel();
    }
  }, [copied, label]);

  const changeCopiedLabel = useCallback(
    isToolTipVisible => {
      if (copied && !isToolTipVisible) {
        setCopied(false);
      }
    },
    [copied]
  );

  return (
    <Stack horizontal={horizontal} className={css(formControlClassName, controlContainerStyle(!!upsellMessage, fullPage))}>
      {(label || (pushContentRight && fullPage)) && (
        <Stack horizontal className={css(formStackStyle(!!upsellMessage, fullPage, horizontal), customLabelStackClassName)}>
          {upsellMessage && (
            <div className={upsellIconStyle}>
              <UpsellIcon upsellMessage={upsellMessage} />
            </div>
          )}
          <Label
            className={css(
              formLabelStyle(!!upsellMessage, fullPage, horizontal, widthLabel),
              customLabelClassName,
              dirty && dirtyElementStyle(theme, true)
            )}
            id={`${id}-label`}>
            <TooltipHost
              overflowMode={TooltipOverflowMode.Self}
              content={label}
              hostClassName={hostStyle(multiline, horizontal)}
              styles={tooltipStyle}>
              {label}
            </TooltipHost>
            {getRequiredIcon(theme, required)}
            {getMouseOverToolTip(children.props.id ?? '', mouseOverToolTip)}
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
      <Stack tokens={{ childrenGap: 0 }} horizontalAlign="start">
        {copyValue && (
          <TooltipHost
            content={getCopiedLabel()}
            calloutProps={{ gapSpace: 0 }}
            onTooltipToggle={isVisible => changeCopiedLabel(isVisible)}>
            <IconButton
              id={`${id}-copy-button`}
              iconProps={{ iconName: 'Copy', styles: copyButtonStyle }}
              onClick={copyToClipboard}
              ariaLabel={getCopiedAriaLabel()}
              componentRef={ref => ref && setCopyButtonRef(ref)}
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
        })}
        aria-hidden="true">
        *
      </span>
    );
  }
};

const getMouseOverToolTip = (id: string, content?: string) => {
  if (content) {
    return <InfoTooltip id={`${id ? id : Guid.newTinyGuid()}-tooltip`} content={content} />;
  }
};

export default ReactiveFormControl;
