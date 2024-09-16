import { ConfigurationPivotProps } from './Configuration.types';
import ConfigurationSnippets from './ConfigurationSnippets';

const ConfigurationPivot: React.FC<ConfigurationPivotProps> = (props: ConfigurationPivotProps) => {
  const { isLoading, hasWritePermissions, formProps, refresh, resourceId } = props;

  return (
    <ConfigurationSnippets
      hasWritePermissions={hasWritePermissions}
      refresh={refresh}
      disabled={isLoading || !hasWritePermissions}
      formProps={formProps}
      isLoading={isLoading}
      resourceId={resourceId}
    />
  );
};

export default ConfigurationPivot;
