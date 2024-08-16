import { css, Link, MessageBar, MessageBarType } from '@fluentui/react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorSvg } from '../../images/Common/Error.svg';
import { ReactComponent as InfoSvg } from '../../images/Common/Info.svg';
import { ReactComponent as WarningSvg } from '../../images/Common/Warning.svg';
import { ThemeContext } from '../../ThemeContext';
import { messageBannerClass, messageBannerIconStyle, messageBannerStyles } from './CustomBanner.styles';

interface CustomBannerProps {
  message: string | JSX.Element;
  type: MessageBarType;
  id?: string;
  customIcon?: JSX.Element;
  className?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  learnMoreLinkAriaLabel?: string;
  onClickLearnMoreLink?: (e?: any) => any;
  onDismiss?: (e?: any) => any;
  undocked?: boolean;
  onClick?: (e?: any) => any;
}

const CustomBanner: React.FC<CustomBannerProps> = props => {
  const {
    message,
    type,
    id,
    customIcon,
    className: customClassName,
    learnMoreText,
    learnMoreLink,
    learnMoreLinkAriaLabel,
    onClickLearnMoreLink,
    onDismiss,
    undocked,
    onClick,
  } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  const className = css(messageBannerClass(theme, type, !!onClick), customClassName);

  // NOTE(yoonaoh): The color of the link is set to the default Fluent UI link color.
  // Using the statusBar link color from @fluentui/azure-themes instead
  const bannerLinkStyle = {
    color: theme?.semanticColors?.link?.toLowerCase() == '#0078d4' ? '#005A9E' : '#6CB8F6',
  };

  const icon = customIcon ? customIcon : _getIconForType(type);

  return (
    <div>
      <MessageBar
        id={`${id}-custom-banner`}
        isMultiline={true}
        messageBarType={type}
        styles={messageBannerStyles(!!icon, !!undocked)}
        className={className}
        onDismiss={onDismiss}
        dismissButtonAriaLabel={t('close')}
        onClick={onClick}>
        {icon ? <span className={messageBannerIconStyle}>{icon}</span> : undefined}
        <span>
          <span tabIndex={0}>{message}</span>
          {(learnMoreLink || onClickLearnMoreLink) && (
            <Link
              style={bannerLinkStyle}
              href={learnMoreLink}
              onClick={onClickLearnMoreLink}
              target="_blank"
              aria-label={learnMoreLinkAriaLabel ? learnMoreLinkAriaLabel : t('learnMore')}>
              {learnMoreText || t('learnMore')}
            </Link>
          )}
        </span>
      </MessageBar>
    </div>
  );
};

const _getIconForType = (messageBarType: MessageBarType): JSX.Element | undefined => {
  switch (messageBarType) {
    case MessageBarType.info: {
      return <InfoSvg />;
    }
    case MessageBarType.warning: {
      return <WarningSvg />;
    }
    case MessageBarType.error: {
      return <ErrorSvg />;
    }
    default: {
      return undefined;
    }
  }
};

export default CustomBanner;
