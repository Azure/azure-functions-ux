import React, { useEffect } from 'react';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import { BindingDirection, BindingType } from '../../../../../../models/functions/function-binding';
import { BindingManager } from '../../../../../../utils/BindingManager';
import CosmosDbIntegration from './test-integration-components/CosmosDbIntegration';
import CustomPanel from '../../../../../../components/CustomPanel/CustomPanel';
// import EventGridIntegration from './test-integration-components/EventGridIntegration';

interface IFunctionTestIntegrationFactoryProps {
  panelProps: any;
  resourceId: string | undefined;
  functionInfo: FunctionInfo;
  testIntegrationList: JSX.Element[];
  setTestIntegrationList: (newTestIntegrationList: JSX.Element[]) => void;
}

const FunctionTestIntegrationFactory = (props: IFunctionTestIntegrationFactoryProps) => {
  const { panelProps, resourceId, functionInfo, testIntegrationList, setTestIntegrationList } = props;

  console.log(functionInfo);

  const buildTestIntegrationList = () => {
    let bindingComponentList: JSX.Element[] = [];

    // Search for the binding types we currently support for 'test integration'
    if (functionInfo.config && functionInfo.config.bindings) {
      functionInfo.config.bindings.forEach(binding => {
        if (BindingManager.isBindingTypeEqual(binding.type, BindingType.cosmosDBTrigger)) {
          // Cosmos DB trigger
          bindingComponentList.push(
            <CosmosDbIntegration
              type={BindingDirection.trigger}
              resourceId={resourceId}
              dbAcctName={!!binding.connectionStringSetting ? binding.connectionStringSetting.split('_')[0] : undefined}
            />
          );
        } else if (BindingManager.isBindingTypeEqual(binding.type, BindingType.cosmosDB)) {
          // Cosmos DB input or output
          bindingComponentList.push(
            <CosmosDbIntegration
              type={binding.direction}
              resourceId={resourceId}
              dbAcctName={!!binding.connectionStringSetting ? binding.connectionStringSetting.split('_')[0] : undefined}
            />
          );
        }

        // TODO: discuss Event Grid integration with designers
      });
    }

    setTestIntegrationList(bindingComponentList);
  };

  // Check for binding types that we 'test integration' with when function info updates
  useEffect(buildTestIntegrationList, [functionInfo]);

  return (
    <CustomPanel
      type={panelProps.type}
      isOpen={panelProps.isOpen}
      onDismiss={panelProps.onDismiss}
      headerContent={panelProps.headerContent}
      isBlocking={panelProps.isBlocking}
      customStyle={panelProps.customStyle}>
      {testIntegrationList}
    </CustomPanel>
  );
};

export default FunctionTestIntegrationFactory;
