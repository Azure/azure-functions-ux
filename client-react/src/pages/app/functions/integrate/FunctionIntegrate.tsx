import React from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { Stack } from 'office-ui-fabric-react';
import TriggerDataFlowCard from './DataFlowDiagram/TriggerDataFlowCard';
import OutputDataFlowCard from './DataFlowDiagram/OutputDataFlowCard';
import InputDataFlowCard from './DataFlowDiagram/InputDataFlowCard';
import FunctionDataFlowCard from './DataFlowDiagram/FunctionDataFlowCard';

export interface FunctionIntegrateProps {
  functionInfo: ArmObj<FunctionInfo>;
}

const paddingStyle = {
  padding: '20px',
};

export const FunctionIntegrate: React.SFC<FunctionIntegrateProps> = props => {
  const { functionInfo } = props;

  const parser = new DOMParser();
  const doc = parser.parseFromString('<root></root>', 'application/xml');
  console.log(doc);

  return (
    <>
      <div style={paddingStyle}>
        <Stack horizontal gap={50} horizontalAlign={'center'} disableShrink>
          <Stack.Item grow>
            <Stack gap={100}>
              <TriggerDataFlowCard functionInfo={functionInfo} />
              <InputDataFlowCard functionInfo={functionInfo} />
            </Stack>
          </Stack.Item>
          <Stack.Item grow>
            <Stack verticalAlign="center" verticalFill={true}>
              <FunctionDataFlowCard functionInfo={functionInfo} />
            </Stack>
          </Stack.Item>
          <Stack.Item grow>
            <Stack verticalAlign="center" verticalFill={true}>
              <OutputDataFlowCard functionInfo={functionInfo} />
            </Stack>
          </Stack.Item>
        </Stack>
      </div>
    </>
  );
};
