import React, { useContext, useState, useEffect } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { useTranslation } from 'react-i18next';
import { Link, IDropdownOption, registerIcons, Icon, Callout } from 'office-ui-fabric-react';
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
import { WorkerRuntimeLanguages } from '../../../../utils/CommonConstants';
import { KeyValue } from '../../../../models/portal-models';
import { Links } from '../../../../utils/FwLinks';
import { calloutStyle } from '../function/function-log/FunctionLog.styles';
import { calloutContent } from '../../deployment-center/DeploymentCenter.styles';

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
  devContainer: string;
  language: string | undefined;
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
  const { site, workerRuntime, resourceId, devContainer, language } = props;
  const [file, setFile] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [showPreviewSteps, setShowPreviewSteps] = useState(false);
  const [isStep1CalloutVisible, setIsStep1CalloutVisible] = useState(false);
  const [isStep2CalloutVisible, setIsStep2CalloutVisible] = useState(false);

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
    return workerRuntime === WorkerRuntimeLanguages.java || !isLinuxApp(site) || !isElastic(site);
  };

  const isCoreToolsOptionVisible = (): boolean => {
    return workerRuntime !== WorkerRuntimeLanguages.java;
  };

  const isMavenToolsOptionVisible = (): boolean => {
    return workerRuntime === WorkerRuntimeLanguages.java;
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
      key: 'vscode-preview',
      text: 'VS Code (Preview)',
      data: {
        icon: <Icon iconName="visual-studio" />,
        visible: true,
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
    if (selectedKey === 'vscode-preview') {
      setShowPreviewSteps(true);
    } else {
      setShowPreviewSteps(false);
      getAndSetSelectedFile(selectedKey);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const getClassicExperience = () => {
    return (
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
    );
  };

  const toggleIsStep1CalloutVisible = () => {
    setIsStep1CalloutVisible(!isStep1CalloutVisible);
  };
  const toggleIsStep2CalloutVisible = () => {
    setIsStep2CalloutVisible(!isStep2CalloutVisible);
  };

  const getPreviewExperience = () => {
    const url = `vscode://ms-azuretools.vscode-azurefunctions/?resourceId=${resourceId}&devcontainer=${devContainer}&language=${language}`;
    return (
      <>
        {isStep1CalloutVisible && (
          <Callout
            className={calloutStyle}
            role="alertdialog"
            gapSpace={0}
            target={`#step1Info`}
            onDismiss={toggleIsStep1CalloutVisible}
            setInitialFocus={true}>
            <div className={calloutContent}>
              <h3>What is installed on your computer</h3>
              <ul>
                <li>Docker Desktop</li>
                <li>VS Code</li>
                <li>Azure Account, Azure Functions, Azure CLI, and Docker VS Code extensions</li>
              </ul>
            </div>
          </Callout>
        )}

        {isStep2CalloutVisible && (
          <Callout
            className={calloutStyle}
            role="alertdialog"
            gapSpace={0}
            target={`#step2Info`}
            onDismiss={toggleIsStep2CalloutVisible}
            setInitialFocus={true}>
            <div className={calloutContent}>
              <h3>How your FunctionApp is provisioned</h3>
              <ul>
                <li>You will be prompted to login to your Azure account for VS Code</li>
                <li>Once the project is provisioned, an option will be provided to open the project in VS Code dev container</li>
                <li>Within the VS Code dev container, you can use the func cli commands to manage your project</li>
              </ul>
            </div>
          </Callout>
        )}

        <h3>Work on your project locally</h3>
        <p>
          As great as the web experience is to get started on your FunctionApp development, nothing can beat the power of developing it
          locally.
        </p>
        <p>Follow the simple steps below to enable local development of your project.</p>
        <ol>
          <li>
            <a href="https://hackathon2020store.blob.core.windows.net/msi/OneClickLocalDev.msi">Download and install</a> prerequisites.{' '}
            <Icon id="step1Info" iconName="Info" onClick={toggleIsStep1CalloutVisible} />
            <br />
            <br />
          </li>
          <li>
            <a href={url}>Click here</a> to provision your FunctionApp project on your local environment.{' '}
            <Icon id="step2Info" iconName="Info" onClick={toggleIsStep2CalloutVisible} />
            <br />
            <br />
          </li>
        </ol>
      </>
    );
  };

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
      {showPreviewSteps ? getPreviewExperience() : getClassicExperience()}
    </div>
  );
};

export default FunctionQuickstart;
