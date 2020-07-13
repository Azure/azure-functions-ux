import React, { useContext, useState, useEffect } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { useTranslation } from 'react-i18next';
import { Link, IDropdownOption, registerIcons, Icon } from 'office-ui-fabric-react';
import {
  formStyle,
  dropdownIconStyle,
  quickstartDropdownContainerStyle,
  quickstartDropdownLabelStyle,
  quickstartLinkStyle,
  markdownIconStyle,
} from './FunctionQuickstart.styles';
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
import { ThemeContext } from '../../../../ThemeContext';
import StringUtils from '../../../../utils/string';
import { ArmResourceDescriptor } from '../../../../utils/resourceDescriptors';
import { QuickstartOptions } from './FunctionQuickstart.types';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { KeyValue } from '../../../../models/portal-models';
import { Links } from '../../../../utils/FwLinks';

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

const ChevronUp: React.FC<{}> = props => {
  const theme = useContext(ThemeContext);

  return <Icon iconName="ChevronUp" className={markdownIconStyle(theme)} />;
};

const FunctionQuickstart: React.FC<FunctionQuickstartProps> = props => {
  const { t } = useTranslation();
  const { site, workerRuntime, resourceId } = props;
  const [file, setFile] = useState('');
  const [selectedKey, setSelectedKey] = useState('');

  const quickstartContext = useContext(FunctionQuickstartContext);
  const startupInfoContext = useContext(StartupInfoContext);
  const theme = useContext(ThemeContext);

  const getParameters = (): KeyValue<string> => {
    const resourceDescriptor = new ArmResourceDescriptor(resourceId);
    return {
      functionAppName: site.name,
      region: site.location,
      resourceGroup: site.properties.resourceGroup,
      subscriptionName: resourceDescriptor.subscription,
      workerRuntime: workerRuntime || '',
    };
  };

  const isVSOptionVisible = (): boolean => {
    return !isLinuxApp(site) && workerRuntime === 'dotnet';
  };

  const isVSCodeOptionVisible = (): boolean => {
    return workerRuntime === CommonConstants.WorkerRuntimeLanguages.java.toLocaleLowerCase() || !isLinuxApp(site) || !isElastic(site);
  };

  const isCoreToolsOptionVisible = (): boolean => {
    return workerRuntime !== CommonConstants.WorkerRuntimeLanguages.java.toLocaleLowerCase();
  };

  const isMavenToolsOptionVisible = (): boolean => {
    return workerRuntime === CommonConstants.WorkerRuntimeLanguages.java.toLocaleLowerCase();
  };

  const dropdownOptions = [
    {
      key: QuickstartOptions.visualStudio,
      text: t('vsCardTitle'),
      data: {
        icon: <Icon iconName="visual-studio" />,
        visible: isVSOptionVisible(),
      },
    },
    {
      key: QuickstartOptions.visualStudioCode,
      text: t('vscodeCardTitle'),
      data: {
        icon: <Icon iconName="vs-code" />,
        visible: isVSCodeOptionVisible(),
      },
    },
    {
      key: QuickstartOptions.coreTools,
      text: t('coretoolsCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
        visible: isCoreToolsOptionVisible(),
      },
    },
    {
      key: QuickstartOptions.maven,
      text: t('mavenCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
        visible: isMavenToolsOptionVisible(),
      },
    },
  ];

  const onChange = async (e: unknown, option: IDropdownOption) => {
    setSelectedKey(option.key as string);
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

  const getAndSetSelectedFile = async (fileName: string) => {
    const result = await quickstartContext.getQuickstartFile(fileName, startupInfoContext.effectiveLocale);
    if (result.metadata.success) {
      setFile(StringUtils.formatString(result.data, getParameters()));
    }
  };

  useEffect(() => {
    setSelectedKey(isVSCodeOptionVisible() ? QuickstartOptions.visualStudioCode : QuickstartOptions.coreTools);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getAndSetSelectedFile(selectedKey);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);
  return (
    <div className={formStyle}>
      <h2>{t('quickstartHeader')}</h2>
      <div>
        {t('quickstartDesc')}
        <Link href={`${Links.quickstartViewDocumentation}&pivots=programming-language-${workerRuntime}`} target="_blank">
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
          selectedKey={selectedKey}
        />
      </div>
      <Markdown
        options={{
          overrides: {
            MarkdownHighlighter: {
              component: MarkdownHighlighter,
            },
            ChevronUp: {
              component: ChevronUp,
            },
            a: {
              props: {
                className: quickstartLinkStyle(theme),
              },
            },
          },
        }}>
        {file}
      </Markdown>
    </div>
  );
};

export default FunctionQuickstart;
