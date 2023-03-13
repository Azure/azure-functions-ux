import { DetailsListLayoutMode, IColumn, PanelType, SelectionMode, TooltipHost } from '@fluentui/react';
import { FormikProps } from 'formik';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormErrorPage } from '../AppSettings.types';
import IconButton from '../../../../components/IconButton/IconButton';
import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { PermissionsContext } from '../Contexts';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import ErrorPageGridAddEdit from './ErrorPageGridAddEdit';
import { boldCellStyle } from './ErrorPageGrid.styles';
import { CommonConstants } from '../../../../utils/CommonConstants';

const ErrorPageGrid: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const [showPanel, setShowPanel] = useState(false);
  const [labelAddEditPane, setLabelAddEditPane] = useState<string | undefined>(undefined);
  const [currentErrorPage, setCurrentErrorPage] = useState<FormErrorPage | null>(null);
  const { values } = props;

  const errorCode = CommonConstants.ErrorPageCode;

  const onCancelPanel = React.useCallback((): void => {
    setShowPanel(false);
  }, [setShowPanel, showPanel]);

  const removeItem = React.useCallback(
    (key: number) => {
      const errorPages: FormErrorPage[] = [...values.errorPages];
      const index = errorPages.findIndex(x => x.key == key);
      errorPages.splice(index, 1);
      props.setValues({
        ...values,
        errorPages,
      });
    },
    [values.errorPages]
  );

  const addEditItem = React.useCallback(
    (item: FormErrorPage, file: string, key: number) => {
      item.content = file;
      item.status = t('errorPage_columnStatus_configured');
      const errorPages: FormErrorPage[] = [...values.errorPages];
      const index = errorPages.findIndex(x => x.key == key);

      if (index > -1) {
        errorPages[index] = item;
      } else {
        errorPages.push(item);
      }

      props.setValues({
        ...values,
        errorPages,
      });
      setShowPanel(false);
    },
    [values.errorPages, currentErrorPage]
  );

  const onShowPanel = React.useCallback(
    (item: FormErrorPage, index: number): void => {
      if (item.status === t('errorPage_columnStatus_configured')) setLabelAddEditPane(t('editErrorPage'));
      else setLabelAddEditPane(t('addErrorPage'));
      setShowPanel(true);
      setCurrentErrorPage(item);
    },
    [values, labelAddEditPane, setLabelAddEditPane, currentErrorPage]
  );

  const getConfigurationStatus = React.useCallback(
    (errorCode: string) => {
      return values.errorPages.some(i => i.errorCode.includes(errorCode))
        ? t('errorPage_columnStatus_configured')
        : t('errorPage_columnStatus_notConfigured');
    },
    [values.errorPages]
  );

  const _columnErrorCode = React.useMemo(
    () => [
      {
        key: 403,
        errorCode: errorCode.errorCode_403,
        status: getConfigurationStatus(errorCode.errorCode_403),
      },
      {
        key: 502,
        errorCode: errorCode.errorCode_502,
        status: getConfigurationStatus(errorCode.errorCode_502),
      },
      {
        key: 503,
        errorCode: errorCode.errorCode_503,
        status: getConfigurationStatus(errorCode.errorCode_503),
      },
    ],
    [values.errorPages]
  );

  const onRenderItemColumn = React.useCallback(
    (item: FormErrorPage, index: number, column: IColumn) => {
      if (!column || !item) {
        return null;
      }

      if (column.key === 'status') {
        return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
      }

      if (column.key === 'delete') {
        return (
          <TooltipHost
            content={item.status == t('errorPage_columnStatus_notConfigured') ? undefined : t('delete')}
            id={`app-settings-errorPages-delete-tooltip-${index}`}
            calloutProps={{ gapSpace: 0 }}
            closeDelay={500}>
            <IconButton
              className={defaultCellStyle}
              disabled={disableAllControls || item.status == t('errorPage_columnStatus_notConfigured')}
              id={`app-settings-errorPages-delete-tooltip-${index}`}
              iconProps={{ iconName: 'Delete' }}
              ariaLabel={t('delete')}
              onClick={() => removeItem(item.key)}
            />
          </TooltipHost>
        );
      }
      if (column.key === 'edit') {
        return (
          <TooltipHost
            content={item.status == t('errorPage_columnStatus_notConfigured') ? t('add') : t('edit')}
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

      return <div className={boldCellStyle}>{item[column.fieldName!]}</div>;
    },
    [removeItem, onShowPanel, disableAllControls, values.errorPages, addEditItem]
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
  }, [onRenderItemColumn, values.errorPages, showPanel, addEditItem, disableAllControls, removeItem]);

  return (
    <>
      <DisplayTableWithEmptyMessage
        columns={getColumns}
        items={_columnErrorCode || []}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
      />
      <CustomPanel type={PanelType.medium} isOpen={showPanel} onDismiss={onCancelPanel} headerText={labelAddEditPane}>
        <ErrorPageGridAddEdit errorPage={currentErrorPage!} closeBlade={onCancelPanel} addEditItem={addEditItem} />
      </CustomPanel>
    </>
  );
};

export default ErrorPageGrid;
