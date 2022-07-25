import { ArmObj } from '../../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import TestExample from './Example';
import { useStyles } from './FunctionTestIntegration.styles';
import { useCosmosDbExamples } from './useCosmosDbExamples';

interface FunctionTestIntegrationProps {
  functionInfo: ArmObj<FunctionInfo>;
}

const FunctionTestIntegration: React.FC<FunctionTestIntegrationProps> = ({ functionInfo }: FunctionTestIntegrationProps) => {
  const styles = useStyles();

  const { input, output, trigger } = useCosmosDbExamples(functionInfo);

  return (
    <main className={styles.content}>
      {trigger && <TestExample {...trigger} />}
      {input && <TestExample {...input} />}
      {output && <TestExample {...output} />}
    </main>
  );
};

export default FunctionTestIntegration;
