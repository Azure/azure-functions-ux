import React, { useContext } from 'react';
import { MessageBar, MessageBarType, Link } from 'office-ui-fabric-react';
import { messageBannerStyles, messageBannerTextStyle, messageBannerIconStyle, messageBannerClass } from './CustomBanner.styles';
import { ThemeContext } from '../../ThemeContext';
import { useTranslation } from 'react-i18next';

interface CustomBannerProps {
  message: string;
  type: MessageBarType;
  id?: string;
  icon?: JSX.Element;
  className?: string;
  learnMoreLink?: string;
}

const CustomBanner: React.FC<CustomBannerProps> = props => {
  const { message, type, id, icon, className: customClassName, learnMoreLink } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  let className = messageBannerClass(theme, type);

  if (!!customClassName) {
    className = Object.assign(className, customClassName);
  }

  return (
    <div>
      <MessageBar
        id={`${id}-custom-banner`}
        isMultiline={true}
        messageBarType={type}
        styles={messageBannerStyles(!!icon)}
        className={className}>
        {!!icon ? <span className={messageBannerIconStyle}>{icon}</span> : undefined}
        <span className={messageBannerTextStyle}>
          {message}
          {learnMoreLink ? (
            <Link href={learnMoreLink} target="_blank">
              {t('learnMore')}
            </Link>
          ) : (
            undefined
          )}
        </span>
      </MessageBar>
    </div>
  );
};

export default CustomBanner;
