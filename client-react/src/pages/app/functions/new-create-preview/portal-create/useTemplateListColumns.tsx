import { IButtonStyles, IColumn, IIconProps, IconButton } from '@fluentui/react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionTemplate } from '../../../../../models/functions/function-template';
import { HostStatus } from '../../../../../models/functions/host-status';
import { RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import StringUtils from '../../../../../utils/string';
import Url from '../../../../../utils/url';
import { templateListNameColumnStyle } from '../FunctionCreate.styles';

const enableNewProgrammingModel = Url.getFeatureValue(CommonConstants.FeatureFlags.enableNewProgrammingModel);

const iconButtonStyles: IButtonStyles = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
};

const iconProps: IIconProps = {
  iconName: 'FileCode',
};

export function useTemplateListColumns(hostStatus?: ArmObj<HostStatus>, useNewProgrammingModel = false) {
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

        case 'view-template':
          return (
            <IconButton
              ariaLabel={t('viewTemplateFormat').format(getTemplateDisplayName(item))}
              href={'https://aka.ms/todo' /** @todo (joechung) */}
              iconProps={iconProps}
              styles={iconButtonStyles}
              target="_blank"
            />
          );
        default:
          return column.fieldName ? <div>{item[column.fieldName]}</div> : null;
      }
    },
    [getTemplateDisplayName, t]
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
      ...(enableNewProgrammingModel && useNewProgrammingModel
        ? [
            {
              key: 'view-template',
              name: t('viewTemplate'),
              fieldName: 'view-template' /** @todo (joechung) */,
              minWidth: 100,
              onRender,
            },
          ]
        : []),
    ];
  }, [onRender, t, useNewProgrammingModel]);

  return columns;
}
