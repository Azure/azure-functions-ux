import { DetailsListLayoutMode, IColumn, SelectionMode, TooltipHost } from '@fluentui/react';
import { FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { IColumnItem } from './ErrorPageGrid.contract';
import IconButton from '../../../../components/IconButton/IconButton';
import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { PermissionsContext } from '../Contexts';

const ErrorPageGrid: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();

  const removeItem = React.useCallback((index: number) => {}, []);

  const onShowPanel = React.useCallback((item: IColumnItem, index: number) => {}, []);

  const _columnErrorCode = React.useMemo(
    () => [
      {
        key: '403',
        errorCode: '403',
        status: t('errorPage_columnStatus_notConfigured'),
      },
      {
        key: '502',
        errorCode: '502',
        status: t('errorPage_columnStatus_notConfigured'),
      },
      {
        key: '503',
        errorCode: '503',
        status: t('errorPage_columnStatus_notConfigured'),
      },
    ],
    []
  );

  const onRenderItemColumn = React.useCallback(
    (item: IColumnItem, index: number, column: IColumn) => {
      if (!column || !item) {
        return null;
      }

      if (column.key === 'delete') {
        return (
          <TooltipHost
            content={t('delete')}
            id={`app-settings-errorPages-delete-tooltip-${index}`}
            calloutProps={{ gapSpace: 0 }}
            closeDelay={500}>
            <IconButton
              className={defaultCellStyle}
              disabled={disableAllControls || item.status === t('errorPage_columnStatus_notConfigured')}
              id={`app-settings-errorPages-delete-tooltip-${index}`}
              iconProps={{ iconName: 'Delete' }}
              ariaLabel={t('delete')}
              onClick={() => removeItem(index)}
            />
          </TooltipHost>
        );
      }
      if (column.key === 'edit') {
        return (
          <TooltipHost
            content={t('edit')}
            id={`app-settings-errorPages-edit-tooltip-${index}`}
            calloutProps={{ gapSpace: 0 }}
            closeDelay={500}>
            <IconButton
              className={defaultCellStyle}
              disabled={disableAllControls}
              id={`app-settings-errorPages-edit-${index}`}
              iconProps={{ iconName: 'Edit' }}
              ariaLabel={t('edit')}
              onClick={() => onShowPanel(item, index)}
            />
          </TooltipHost>
        );
      }
      return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
    },
    [removeItem, onShowPanel, disableAllControls]
  );

  const getColumns = React.useMemo((): IColumn[] => {
    return [
      {
        key: 'errorCode',
        name: t('errorPage_columnErrorCode'),
        ariaLabel: t('errorPage_columnErrorCode'),
        fieldName: 'errorCode',
        minWidth: 100,
        maxWidth: 220,
        isRowHeader: true,
        isResizable: true,
        data: 'string',
        onRender: onRenderItemColumn,
      },
      {
        key: 'status',
        name: t('errorPage_columnStatus'),
        ariaLabel: t('errorPage_columnStatus'),
        fieldName: 'status',
        minWidth: 100,
        maxWidth: 220,
        isRowHeader: true,
        isResizable: true,
        data: 'string',
        onRender: onRenderItemColumn,
      },
      {
        key: 'delete',
        name: t('delete'),
        fieldName: 'delete',
        ariaLabel: t('delete'),
        minWidth: 50,
        maxWidth: 50,
        isRowHeader: true,
        isResizable: true,
        data: 'string',
        onRender: onRenderItemColumn,
      },
      {
        key: 'edit',
        name: t('edit'),
        ariaLabel: t('edit'),
        fieldName: 'edit',
        minWidth: 50,
        maxWidth: 50,
        isRowHeader: true,
        isResizable: true,
        data: 'string',
        onRender: onRenderItemColumn,
      },
    ];
  }, [onRenderItemColumn]);

  return (
    <DisplayTableWithEmptyMessage
      columns={getColumns}
      items={_columnErrorCode || []}
      isHeaderVisible={true}
      layoutMode={DetailsListLayoutMode.justified}
      selectionMode={SelectionMode.none}
      selectionPreservedOnEmptyClick={true}
    />
  );
};

export default ErrorPageGrid;
