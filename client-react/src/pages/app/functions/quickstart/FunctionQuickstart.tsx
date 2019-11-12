import React, { useContext, useState } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { useTranslation } from 'react-i18next';
import { Link, IDropdownOption, registerIcons, Icon } from 'office-ui-fabric-react';
import { formStyle, dropdownIconStyle, quickstartDropdownContainerStyle, quickstartDropdownLabelStyle } from './FunctionQuickstart.styles';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { ReactComponent as VSCodeIconSvg } from '../../../../images/Functions/vs_code.svg';
import { ReactComponent as TerminalIconSvg } from '../../../../images/Functions/terminal.svg';
import { ReactComponent as VisualStudioIconSvg } from '../../../../images/Functions/visual_studio.svg';
import { FunctionQuickstartContext } from './FunctionQuickstartDataLoader';

registerIcons({
  icons: {
    'vs-code': <VSCodeIconSvg className={dropdownIconStyle} />,
    'visual-studio': <VisualStudioIconSvg className={dropdownIconStyle} />,
    terminal: <TerminalIconSvg className={dropdownIconStyle} />,
  },
});

export interface FunctionQuickstartProps {
  resourceId: string;
  site: ArmObj<Site>;
}

export interface QuickstartOption {
  key: string;
  text: string;
  data: {
    icon: string;
    description: string;
  };
}

const FunctionQuickstart: React.FC<FunctionQuickstartProps> = props => {
  const { t } = useTranslation();
  const [file, setFile] = useState('');
  const quickstartContext = useContext(FunctionQuickstartContext);

  const dropdownOptions = [
    {
      key: 'vsDirectPublish',
      text: t('vsCardTitle'),
      data: {
        icon: <Icon iconName="visual-studio" />,
      },
    },
    {
      key: 'vsCodeDirectPublish',
      text: t('vscodeCardTitle'),
      data: {
        icon: <Icon iconName="vs-code" />,
      },
    },
    {
      key: 'coretoolsDirectPublish',
      text: t('coretoolsCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
      },
    },
    {
      key: 'mavenDirectPublish',
      text: t('mavenCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
      },
    },
  ];

  const onChange = async (e: unknown, option: IDropdownOption) => {
    const result = await quickstartContext.getQuickstartFilename(option.key as string);
    if (result.metadata.success) {
      setFile(result.data);
    }
  };

  const onRenderOption = (option: IDropdownOption): JSX.Element => {
    return (
      <div>
        {option.data.icon}
        {option.text}
      </div>
    );
  };

  return (
    <div className={formStyle}>
      <h2>{t('quickstartHeader')}</h2>
      <div>
        {t('quickstartDesc')}
        <Link href={'functions.azure.com'} target="_blank">
          {t('viewDocumentation')}
        </Link>
      </div>
      <div className={quickstartDropdownContainerStyle}>
        <div className={quickstartDropdownLabelStyle}>{t('chooseDevelopmentEnv')}</div>
        <DropdownNoFormik
          id="quickstart-dropdown"
          options={dropdownOptions}
          onChange={onChange}
          defaultValue={dropdownOptions[0].key}
          responsiveMode={ResponsiveMode.large}
          onRenderOption={onRenderOption}
        />
      </div>
      <div>{file}</div>
    </div>
  );
};

export default FunctionQuickstart;
