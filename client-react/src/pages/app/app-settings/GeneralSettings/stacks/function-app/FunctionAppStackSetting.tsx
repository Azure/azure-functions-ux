import { StackProps } from '../../WindowsStacks/WindowsStacks';
import DropdownNoFormik from '../../../../../../components/form-controls/DropDownnoFormik';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FunctionAppStacksContext } from '../../../Contexts';
import { FunctionAppStack } from '../../../../../../models/stacks/function-app-stacks';

const FunctionAppStackSetting: React.FC<StackProps> = props => {
  const { t } = useTranslation();
  const { values } = props;
  const functionAppStacksContext = useContext(FunctionAppStacksContext);

  const [runtimeStack, setRuntimeStack] = useState<string | undefined>(undefined);
  const [currentStackData, setCurrentStackData] = useState<FunctionAppStack | undefined>(undefined);

  const setInitialData = () => {
    const runtimeStack = values.currentlySelectedStack;
    if (runtimeStack && functionAppStacksContext.length > 0) {
      setRuntimeStack(runtimeStack);
      setCurrentStackData(functionAppStacksContext.find(stack => stack.value === runtimeStack));
    }
  };

  useEffect(() => {
    setInitialData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.currentlySelectedStack, functionAppStacksContext]);
  return !!runtimeStack && !!currentStackData ? (
    <>
      <DropdownNoFormik
        selectedKey={runtimeStack}
        disabled={true}
        onChange={() => {}}
        options={[{ key: runtimeStack, text: currentStackData.displayText }]}
        label={t('stack')}
        id="function-app-stack"
      />
    </>
  ) : null;
};

export default FunctionAppStackSetting;
