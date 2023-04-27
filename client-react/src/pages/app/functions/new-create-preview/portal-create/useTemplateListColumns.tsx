import { IColumn } from '@fluentui/react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionTemplate } from '../../../../../models/functions/function-template';
import { HostStatus } from '../../../../../models/functions/host-status';
import { RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import StringUtils from '../../../../../utils/string';
import { templateListNameColumnStyle } from '../FunctionCreate.styles';

export function useTemplateListColumns(hostStatus?: ArmObj<HostStatus>) {
  const { t } = useTranslation();

  const runtimeVersion = useMemo(
    () => (hostStatus?.properties.version ? StringUtils.getRuntimeVersionString(hostStatus.properties.version) : ''),
    [hostStatus?.properties.version]
  );

  const getTemplateDisplayName = useCallback(
    (item: FunctionTemplate) => (runtimeVersion === RuntimeExtensionMajorVersions.v1 ? `${item.name}: ${item.language}` : item.name),
    [runtimeVersion]
  );

  const onRender = useCallback(
    (item?: FunctionTemplate, _?, column?: IColumn): JSX.Element | null => {
      if (!column || !item) {
        return null;
      }

      switch (column.key) {
        case 'template':
          return <div className={templateListNameColumnStyle}>{getTemplateDisplayName(item)}</div>;
        default:
          return column.fieldName ? <div>{item[column.fieldName]}</div> : null;
      }
    },
    [getTemplateDisplayName]
  );

  const columns = useMemo<IColumn[]>(() => {
    return [
      {
        key: 'template',
        name: t('template'),
        fieldName: 'template',
        isMultiline: true,
        isResizable: true,
        maxWidth: 225,
        minWidth: 100,
        onRender,
      },
      {
        key: 'description',
        name: t('description'),
        fieldName: 'description',
        isMultiline: true,
        isResizable: true,
        minWidth: 100,
        onRender,
      },
    ];
  }, [onRender, t]);

  return columns;
}
