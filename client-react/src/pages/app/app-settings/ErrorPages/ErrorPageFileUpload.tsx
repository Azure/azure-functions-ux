import React from 'react';
import { IColumnItem } from './ErrorPageGrid.contract';
import { PrimaryButton, Stack, StackItem, TextField } from '@fluentui/react';
import { Field } from 'formik';
import { Text } from '@fluentui/react/lib/components/Text';
import { useTranslation } from 'react-i18next';
import { uploadStyle, stackStyle, stackTokens } from './ErrorPageGrid.styles';

export interface ErrorPageFileUploaderProps {
  errorPage: IColumnItem | null;
  label: string;
}

const ErrorPageFileUploader: React.FC<ErrorPageFileUploaderProps> = props => {
  const { t } = useTranslation();

  const onUploadButtonClick = () => {};

  return (
    <>
      <Text className={uploadStyle.labelHeader}>{t('errorPage')}</Text>
      <Stack horizontal className={stackStyle} tokens={stackTokens}>
        <StackItem grow={5}>
          <TextField id="titleField" readOnly />
        </StackItem>
        <StackItem>
          <Field
            id="container-privateRegistry-composeYml"
            name="privateRegistryComposeYml"
            component={PrimaryButton}
            label={t('browse')}
            text={t('browse')}
            onClick={onUploadButtonClick}
          />
        </StackItem>
      </Stack>
    </>
  );
};

export default ErrorPageFileUploader;
