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
import { isLinuxApp, isElastic } from '../../../../utils/arm-utils';
import Markdown from 'markdown-to-jsx';
import { MarkdownHighlighter } from '../../../../components/MarkdownComponents/MarkdownComponents';
import { StartupInfoContext } from '../../../../StartupInfoContext';
import StringUtils from '../../../../utils/string';
import { ArmResourceDescriptor } from '../../../../utils/resourceDescriptors';

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
  workerRuntime: string | undefined;
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
  const { site, workerRuntime, resourceId } = props;
  const [file, setFile] = useState('');
  const quickstartContext = useContext(FunctionQuickstartContext);
  const startupInfoContext = useContext(StartupInfoContext);

  const getParameters = (): { [key: string]: string } => {
    const resourceDescriptor = new ArmResourceDescriptor(resourceId);
    return {
      functionAppName: site.name,
      region: site.location,
      resourceGroup: site.properties.resourceGroup,
      subscriptionName: resourceDescriptor.subscription,
      workerRuntime: workerRuntime,
    };
  };

  const isVSOptionVisible = (): boolean => {
    return !isLinuxApp(site) && workerRuntime === 'dotnet';
  };

  const isVSCodeOptionVisible = (): boolean => {
    return !isLinuxApp(site) || !isElastic(site);
  };

  const isCoreToolsOptionVisible = (): boolean => {
    return workerRuntime !== 'java';
  };

  const isMavenToolsOptionVisible = (): boolean => {
    return workerRuntime === 'java';
  };

  const dropdownOptions = [
    {
      key: 'vsDirectPublish',
      text: t('vsCardTitle'),
      data: {
        icon: <Icon iconName="visual-studio" />,
        visible: isVSOptionVisible(),
      },
    },
    {
      key: 'vsCodeDirectPublish',
      text: t('vscodeCardTitle'),
      data: {
        icon: <Icon iconName="vs-code" />,
        visible: isVSCodeOptionVisible(),
      },
    },
    {
      key: 'coretoolsDirectPublish',
      text: t('coretoolsCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
        visible: isCoreToolsOptionVisible(),
      },
    },
    {
      key: 'mavenDirectPublish',
      text: t('mavenCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
        visible: isMavenToolsOptionVisible(),
      },
    },
  ];

  const onChange = async (e: unknown, option: IDropdownOption) => {
    const key = option.key as string;
    const result = await quickstartContext.getQuickstartFile(key, startupInfoContext.effectiveLocale);
    if (result.metadata.success) {
      setFile(StringUtils.formatString(result.data, getParameters()));
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

  const onRenderTitle = (selectedOptions: IDropdownOption[]): JSX.Element => {
    return selectedOptions.length > 0 ? (
      <div>
        {selectedOptions[0].data.icon}
        {selectedOptions[0].text}
      </div>
    ) : (
      <></>
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
          options={dropdownOptions.filter(option => option.data.visible)}
          onChange={onChange}
          responsiveMode={ResponsiveMode.large}
          onRenderOption={onRenderOption}
          onRenderTitle={onRenderTitle}
        />
      </div>
      <Markdown
        options={{
          overrides: {
            MarkdownHighlighter: {
              component: MarkdownHighlighter,
            },
          },
        }}>
        {file}
      </Markdown>
    </div>
  );
};

export default FunctionQuickstart;
