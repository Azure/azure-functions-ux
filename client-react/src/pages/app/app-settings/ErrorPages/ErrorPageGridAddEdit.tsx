import React from 'react';
import { useTranslation } from 'react-i18next';

import { Stack } from '@fluentui/react/lib/Stack';

import ActionBar from '../../../../components/ActionBar';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import { FormErrorPage } from '../AppSettings.types';

import ErrorPageFileUploader from './ErrorPageFileUpload';

export interface ErrorPageGridAddEditProps {
  errorPage: FormErrorPage;
  closeBlade: () => void;
  addEditItem: (item: FormErrorPage, file: string, key: number) => void;
}

const ErrorPageGridAddEdit: React.FC<ErrorPageGridAddEditProps> = React.memo((props: ErrorPageGridAddEditProps) => {
  const { errorPage, closeBlade, addEditItem } = props;
  const { t } = useTranslation();
  const [fileUploadSuccess, setFileUploadSuccess] = React.useState(false);
  const [file, setFile] = React.useState<string>('');

  const cancel = () => {
    closeBlade();
  };

  const save = () => {
    addEditItem(errorPage, file, errorPage.key);
  };

  const actionBarPrimaryButtonProps = React.useMemo(() => {
    return {
      id: 'save',
      title: t('upload'),
      onClick: save,
      disable: !fileUploadSuccess,
    };
  }, [fileUploadSuccess]);

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
      <p id="error-pages-info-message">{t('errorPagesEditMessage')}</p>
      <Stack>
        <ErrorPageFileUploader setFile={setFile} fileUploadSuccess={fileUploadSuccess} setFileUploadSuccess={setFileUploadSuccess} />
      </Stack>
      <ActionBar id="error-page-edit-footer" primaryButton={actionBarPrimaryButtonProps} secondaryButton={actionBarSecondaryButtonProps} />
    </form>
  );
});

ErrorPageGridAddEdit.displayName = 'ErrorPageGridAddEdit';

export default ErrorPageGridAddEdit;
