import React from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../components/ActionBar';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import { IColumnItem } from './ErrorPageGrid.contract';
import { Stack } from '@fluentui/react/lib/Stack';
import ErrorPageFileUploader from './ErrorPageFileUpload';

export interface ErrorPageGridAddEditProps {
  errorPage: IColumnItem | null;
  closeBlade: () => void;
}

const ErrorPageGridAddEdit: React.FC<ErrorPageGridAddEditProps> = props => {
  const { errorPage, closeBlade } = props;
  const { t } = useTranslation();

  const cancel = () => {
    closeBlade();
  };

  console.log(errorPage);

  const actionBarPrimaryButtonProps = React.useMemo(() => {
    return {
      id: 'save',
      title: t('upload'),
      onClick: cancel,
      disable: false,
    };
  }, []);

  const actionBarSecondaryButtonProps = React.useMemo(() => {
    return {
      id: 'cancel',
      title: t('cancel'),
      onClick: cancel,
      disable: false,
    };
  }, []);

  return (
    <form className={addEditFormStyle}>
      <p id="default-documents-info-message">{t('errorPagesEditMessage')}</p>
      <Stack>
        <ErrorPageFileUploader label={t('errorPage')} errorPage={errorPage}></ErrorPageFileUploader>
      </Stack>
      <ActionBar id="error-page-edit-footer" primaryButton={actionBarPrimaryButtonProps} secondaryButton={actionBarSecondaryButtonProps} />
    </form>
  );
};

export default ErrorPageGridAddEdit;
