import React, { useContext, useEffect, useState } from 'react';
import Markdown from 'markdown-to-jsx';

import { MarkdownHighlighter, SlotComponent, StackInstructions } from '../../../../../components/MarkdownComponents/MarkdownComponents';
import CustomElementsShimmer from '../../../../../components/shimmer/CustomElementsShimmer';
import { PortalContext } from '../../../../../PortalContext';
import { SiteStateContext } from '../../../../../SiteState';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { ThemeContext } from '../../../../../ThemeContext';
import { ArmResourceDescriptor, ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import StringUtils from '../../../../../utils/string';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import FunctionCreateData from '../FunctionCreate.data';
import { localCreateContainerStyle } from '../FunctionCreate.styles';
import { DevelopmentExperience } from '../FunctionCreate.types';

import { ChevronUp } from './CustomMarkdownComponents';
import { linkStyle } from './LocalCreateInstructions.style';

export interface LocalCreateInstructionsProps {
  resourceId: string;
  localDevExperience?: DevelopmentExperience;
  workerRuntime?: string;
}

const LocalCreateInstructions: React.FC<LocalCreateInstructionsProps> = props => {
  const { localDevExperience, resourceId, workerRuntime } = props;
  const [instructions, setInstructions] = useState<string | undefined | null>(undefined);

  const startupInfoContext = useContext(StartupInfoContext);
  const theme = useContext(ThemeContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

  const site = siteStateContext.site;

  const getParameters = () => {
    const resourceDescriptor = new ArmResourceDescriptor(resourceId);
    return {
      functionAppName: site?.name ?? '',
      region: site?.location ?? '',
      resourceGroup: site?.properties.resourceGroup ?? '',
      subscriptionName: resourceDescriptor.subscription,
      workerRuntime: workerRuntime || '',
      slotName: site ? new ArmSiteDescriptor(site.id).slot || '' : '',
    };
  };

  const fetchData = async () => {
    if (localDevExperience) {
      const localDevExperienceResponse = await FunctionCreateData.getLocalDevExperienceInstructions(
        localDevExperience,
        startupInfoContext.effectiveLocale
      );
      if (localDevExperienceResponse.metadata.success) {
        setInstructions(StringUtils.formatString(localDevExperienceResponse.data, getParameters()));
        // setInstructions(undefined);
      } else {
        setInstructions(null);
        portalContext.log(
          getTelemetryInfo('error', 'getLocalDevExperienceInstructions', 'failed', {
            error: localDevExperienceResponse.metadata.error,
            message: 'Failed to fetch instructions',
          })
        );
      }
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDevExperience]);

  return (
    <div className={localCreateContainerStyle}>
      {instructions === undefined ? (
        <CustomElementsShimmer />
      ) : instructions === null ? (
        <>{/** TODO(krmitta): Add Error banner */}</>
      ) : (
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
                  className: linkStyle(theme),
                },
              },
              StackInstructions: {
                component: StackInstructions,
                props: {
                  stack: workerRuntime,
                },
              },
              SlotComponent: {
                component: SlotComponent,
                props: {
                  slotName: getParameters().slotName,
                },
              },
            },
          }}>
          {instructions}
        </Markdown>
      )}
    </div>
  );
};

export default LocalCreateInstructions;
