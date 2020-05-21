import { Link, MessageBar, MessageBarType } from 'office-ui-fabric-react';
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
  onDismiss?: (e?: any) => any;
  undocked?: boolean;
}

const CustomBanner: React.FC<CustomBannerProps> = props => {
  const { message, type, id, customIcon, className: customClassName, learnMoreLink, onDismiss, undocked } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  let className = messageBannerClass(theme, type);

  if (!!customClassName) {
    className = Object.assign(className, customClassName);
  }

  const icon = customIcon ? customIcon : _getIconForType(type);

  return (
    <div>
      <MessageBar
        id={`${id}-custom-banner`}
        isMultiline={true}
        messageBarType={type}
        styles={messageBannerStyles(!!icon, !!undocked)}
        className={className}
        onDismiss={onDismiss}>
        {!!icon ? <span className={messageBannerIconStyle}>{icon}</span> : undefined}
        <span>
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
