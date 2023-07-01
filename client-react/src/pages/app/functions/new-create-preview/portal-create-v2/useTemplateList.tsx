import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IColumn, IDetailsRowProps, IRenderFunction, Selection, SelectionMode } from '@fluentui/react';

import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { HostStatus } from '../../../../../models/functions/host-status';
import { RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import { ThemeContext } from '../../../../../ThemeContext';
import StringUtils from '../../../../../utils/string';
import { useTemplatesQuery } from '../../function/hooks/useTemplatesQuery';
import { tableRowStyle, templateListNameColumnStyle } from '../FunctionCreate.styles';
import { FunctionCreateContext } from '../FunctionCreateContext';

export function useTemplateList(
  resourceId: string,
  onTemplateSelect: (template: FunctionTemplateV2) => void,
  hostStatus?: ArmObj<HostStatus>
) {
  const { t } = useTranslation();

  const functionCreateContext = useContext(FunctionCreateContext);
  const disabled = !!functionCreateContext.creatingFunction;

  const { templates } = useTemplatesQuery(resourceId);

  const theme = useContext(ThemeContext);

  const [filter, setFilter] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FunctionTemplateV2>();

  const items = useMemo(
    () =>
      templates?.filter(template => {
        const lowercasedFilterValue = filter?.toLocaleLowerCase();
        return (
          template.name.toLocaleLowerCase().includes(lowercasedFilterValue) ||
          template.description.toLocaleLowerCase().includes(lowercasedFilterValue)
        );
      }) ?? [],
    [filter, templates]
  );

  const runtimeVersion = useMemo(
    () => (hostStatus?.properties.version ? StringUtils.getRuntimeVersionString(hostStatus.properties.version) : ''),
    [hostStatus?.properties.version]
  );

  const getTemplateDisplayName = useCallback(
    (item: FunctionTemplateV2) => (runtimeVersion === RuntimeExtensionMajorVersions.v1 ? `${item.name}: ${item.language}` : item.name),
    [runtimeVersion]
  );

  const onRender = useCallback(
    (item?: FunctionTemplateV2, _?, column?: IColumn): JSX.Element | null => {
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

  const onRenderRow = useCallback<IRenderFunction<IDetailsRowProps>>(
    (props?: IDetailsRowProps, defaultRenderer?): JSX.Element | null => {
      return props && defaultRenderer
        ? defaultRenderer({
            ...props,
            styles: tableRowStyle(theme, !!selectedTemplate && props.item.id === selectedTemplate.id, disabled),
          })
        : null;
    },
    [disabled, selectedTemplate, theme]
  );

  const columns = useMemo<IColumn[]>(() => {
    return [
      {
        key: 'template',
        name: t('template'),
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

  const selection = useRef(
    new Selection({
      onSelectionChanged: () => {
        const selectedItems = selection.current.getSelection();
        if (selectedItems[0]) {
          const template = selectedItems[0] as FunctionTemplateV2;
          setSelectedTemplate(template);
          onTemplateSelect(template);
        }
      },
      selectionMode: SelectionMode.single,
    })
  );

  return {
    columns,
    disabled,
    filter,
    items,
    onRenderRow,
    selectedTemplate,
    selection,
    setFilter,
    templates,
  };
}
