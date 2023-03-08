import { DetailsListLayoutMode, IColumn, SelectionMode } from '@fluentui/react';
import { FormikProps } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettingsFormValues } from '../AppSettings.types';
import { IColumnItem } from './ErrorPageGrid.contract';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';

const ErrorPageGrid: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();

  const _columnErrorCode = () => {
    const items: IColumnItem[] = [];

    items.push({
      key: '403',
      errorCode: '403',
      status: t('errorPage_columnStatus_notConfigured'),
    });
    items.push({
      key: '502',
      errorCode: '502',
      status: t('errorPage_columnStatus_notConfigured'),
    });
    items.push({
      key: '503',
      errorCode: '503',
      status: t('errorPage_columnStatus_notConfigured'),
    });

    return items;
  };

  //   const onRenderColumnItem = React.useCallback((item: ErrorPageGridItem, index: number, column: IColumn) => {
  //     const fieldContent = item[column.fieldName as keyof ErrorPageGridItem] as string;

  //     if (column.key === 'errorCode') {
  //         return (
  //             <p>{'code 403'}</p>
  //         );
  //     } else {
  //         return <span>{fieldContent}</span>;
  //     }
  // }, []);

  const getColumns = (): IColumn[] => {
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
      },
      {
        key: 'delete',
        name: t('delete'),
        fieldName: 'delete',
        ariaLabel: t('delete'),
        minWidth: 100,
        maxWidth: 220,
        isRowHeader: true,
        isResizable: true,
        data: 'string',
      },
      {
        key: 'edit',
        name: t('edit'),
        ariaLabel: t('edit'),
        fieldName: 'edit',
        minWidth: 100,
        maxWidth: 220,
        isRowHeader: true,
        isResizable: true,
        data: 'string',
      },
    ];
  };

  return (
    <>
      <DisplayTableWithCommandBar
        columns={getColumns()}
        items={_columnErrorCode() || []}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
      />
    </>
  );
};

export default ErrorPageGrid;
