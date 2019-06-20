import React from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { Stack } from 'office-ui-fabric-react';
import TriggerDataFlowCard from './DataFlowDiagram/TriggerDataFlowCard';
import { FunctionBinding, BindingDirection } from '../../../../models/functions/function-binding';
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

  const triggers = getTriggers(functionInfo.properties.config.bindings);
  const inputs = getBindings(functionInfo.properties.config.bindings, BindingDirection.in);
  const outputs = getBindings(functionInfo.properties.config.bindings, BindingDirection.out);

  return (
    <>
      <div style={paddingStyle}>
        <Stack horizontal gap={50} horizontalAlign={'center'} disableShrink>
          <Stack.Item grow>
            <Stack gap={100}>
              <TriggerDataFlowCard items={triggers} />
              <InputDataFlowCard items={inputs} />
            </Stack>
          </Stack.Item>
          <Stack.Item grow>
            <Stack verticalAlign="center" verticalFill={true}>
              <FunctionDataFlowCard items={[]} functionName={functionInfo.properties.name} />
            </Stack>
          </Stack.Item>
          <Stack.Item grow>
            <Stack verticalAlign="center" verticalFill={true}>
              <OutputDataFlowCard items={outputs} />
            </Stack>
          </Stack.Item>
        </Stack>
      </div>
    </>
  );
};

const getTriggers = (bindings: FunctionBinding[]) => {
  const trigger = bindings.find(b => {
    return b.direction === 'in' && b.type.toLowerCase().indexOf('trigger') > -1;
  });

  return trigger ? [trigger] : [];
};

const getBindings = (bindings: FunctionBinding[], direction: BindingDirection) => {
  return bindings.filter(b => {
    if (direction === BindingDirection.in) {
      return b.direction === direction && b.type.toLowerCase().indexOf('trigger') === -1;
    }

    return b.direction === direction;
  });
};
