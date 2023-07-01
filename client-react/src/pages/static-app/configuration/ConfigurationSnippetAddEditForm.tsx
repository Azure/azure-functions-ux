import { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';

import { IChoiceGroupOption, IDropdownOption, MessageBarType, ProgressIndicator } from '@fluentui/react';

import ActionBar from '../../../components/ActionBar';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import Dropdown from '../../../components/form-controls/DropDown';
import RadioButton from '../../../components/form-controls/RadioButton';
import RadioButtonNoFormik from '../../../components/form-controls/RadioButtonNoFormik';
import TextField from '../../../components/form-controls/TextField';
import MonacoEditor, { getMonacoEditorTheme } from '../../../components/monaco-editor/monaco-editor';
import { PortalTheme } from '../../../models/portal-models';
import { StartupInfoContext } from '../../../StartupInfoContext';
import { EditorLanguage } from '../../../utils/EditorManager';
import { bodyEditorStyle } from '../../app/functions/function/function-editor/function-test/FunctionTest.styles';

import { useStyles } from './Configuration.styles';
import {
  ApplicableEnvironmentsMode,
  ConfigurationSnippetsAddEditFormProps,
  SnippetInsetionLocation,
  SnippetLocation,
} from './Configuration.types';

const ConfigurationSnippetsAddEditForm: React.FC<ConfigurationSnippetsAddEditFormProps> = ({
  hasWritePermissions,
  atSnippetsLimit,
  statusMessage,
  environmentDropdownOptions,
  isLoading,
  formProps,
  disabled,
  dismissPanel,
}: ConfigurationSnippetsAddEditFormProps) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const startUpInfoContext = useContext(StartupInfoContext);
  const monacoEditorHeight = 'calc(68vh - 100px)';

  const isEnvironmentDropdownVisible = useMemo(() => {
    return formProps.values.snippetApplicableEnvironmentsMode === ApplicableEnvironmentsMode.SpecifiedEnvironments;
  }, [formProps.values.snippetApplicableEnvironmentsMode]);

  useEffect(() => {
    const isDirty =
      formProps.values.snippetName !== formProps.initialValues.snippetName ||
      formProps.values.snippetName !== formProps.initialValues.snippetName ||
      formProps.values.snippetLocation !== formProps.initialValues.snippetLocation ||
      formProps.values.snippetInsertBottom !== formProps.initialValues.snippetInsertBottom ||
      formProps.values.snippetEnvironments !== formProps.initialValues.snippetEnvironments ||
      formProps.values.snippetApplicableEnvironmentsMode !== formProps.initialValues.snippetApplicableEnvironmentsMode ||
      formProps.values.snippetContent !== formProps.initialValues.snippetContent;

    formProps.setFieldValue('isSnippetsDirty', isDirty);
  }, [
    formProps.values.snippetName,
    formProps.values.snippetLocation,
    formProps.values.snippetEnvironments,
    formProps.values.snippetInsertBottom,
    formProps.values.snippetApplicableEnvironmentsMode,
    formProps.values.snippetContent,
  ]);

  const onSnippetContentChange = newText => {
    formProps.setFieldValue('snippetContent', newText);
  };

  const onSnippetInsertionLocationChange = (_ev: any, option: IChoiceGroupOption) => {
    formProps.setFieldValue('snippetInsertBottom', option.key === SnippetInsetionLocation.append);
  };

  const onSnippetEnvironmentsChange = (_ev: any, option: IDropdownOption) => {
    if (option) {
      let newEnvironments = formProps.values.snippetEnvironments;
      newEnvironments = option.selected ? [...newEnvironments, option.key as string] : newEnvironments.filter(key => key !== option.key);
      formProps.setFieldValue('snippetEnvironments', newEnvironments);
    }
  };

  return (
    <>
      {isLoading ? (
        <ProgressIndicator description={t('staticSite_loadingSnippets')} ariaValueText={t('staticSite_loadingSnippets')} />
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.description}>
              <span id="snippets-description">{t('staticSite_SnippetsDescription')} </span>
            </div>
            {!hasWritePermissions && <CustomBanner message={t('staticSite_readOnlyRbac')} type={MessageBarType.info} />}
            {hasWritePermissions && atSnippetsLimit && <CustomBanner message={t('staticSite_snippetsMax')} type={MessageBarType.warning} />}
          </section>
          <section className={styles.section}>
            <Field
              name="snippetLocation"
              id="snippet-location-selection"
              label={t('location')}
              component={Dropdown}
              options={[
                { key: SnippetLocation.Head, text: t('staticSite_head') },
                { key: SnippetLocation.Body, text: t('staticSite_body') },
              ]}
              ariaLabel={t('location')}
              disabled={disabled}
            />
            <Field
              name="snippetName"
              id="snippet-name-textbox"
              placeholder={t('staticSite_snippetNamePlaceholder')}
              label={t('nameRes')}
              component={TextField}
              ariaLabel={t('nameRes')}
              disabled={disabled}
            />
            <RadioButtonNoFormik
              label={t('staticSite_insertionLocation')}
              id="snippet-insertion-location-selector"
              onChange={onSnippetInsertionLocationChange}
              ariaLabelledBy={t('staticSite_insertionLocation')}
              disabled={disabled}
              options={[
                { key: SnippetInsetionLocation.prepend, text: t('staticSite_prepend') },
                { key: SnippetInsetionLocation.append, text: t('staticSite_append') },
              ]}
              selectedKey={formProps.values.snippetInsertBottom ? SnippetInsetionLocation.append : SnippetInsetionLocation.prepend}
            />
            <Field
              name="snippetApplicableEnvironmentsMode"
              label={t('staticSite_environment')}
              id="snippet-environment-mode-selector"
              component={RadioButton}
              ariaLabelledBy={t('staticSite_environment')}
              disabled={disabled}
              options={[
                { key: ApplicableEnvironmentsMode.AllEnvironments, text: t('staticSite_allEnvironments') },
                { key: ApplicableEnvironmentsMode.SpecifiedEnvironments, text: t('staticSite_selectEnvironments') },
              ]}
            />
            {isEnvironmentDropdownVisible && (
              <div className={styles.paddingDropdownStyle}>
                <Field
                  name="snippetEnvironments"
                  id="configuration-environment-selector"
                  label={' '}
                  component={Dropdown}
                  placeholder={t('staticSite_environmentSelectPlaceholder')}
                  ariaLabel={t('staticSite_environmentDropdownAriaLabel')}
                  selectedKeys={formProps.values.snippetEnvironments}
                  multiSelect
                  options={environmentDropdownOptions}
                  onChange={onSnippetEnvironmentsChange}
                  disabled={disabled}
                />
              </div>
            )}
          </section>
          <section className={styles.section}>
            <div className={bodyEditorStyle}>
              <MonacoEditor
                className={bodyEditorStyle}
                value={formProps.values.snippetContent ?? ''}
                language={EditorLanguage.markdown}
                onChange={onSnippetContentChange}
                height={monacoEditorHeight}
                disabled={disabled}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  cursorBlinking: true,
                }}
                theme={getMonacoEditorTheme(startUpInfoContext.theme as PortalTheme)}
              />
            </div>
          </section>
        </>
      )}
      <ActionBar
        id="function-test-footer"
        primaryButton={{
          id: 'ok',
          title: t('ok'),
          onClick: formProps.submitForm,
          disable: !formProps.values.isSnippetsDirty || disabled || !!statusMessage,
          autoFocus: true,
        }}
        secondaryButton={{
          id: 'close',
          title: t('close'),
          onClick: dismissPanel,
          disable: false,
        }}
        statusMessage={statusMessage}
      />
    </>
  );
};

export default ConfigurationSnippetsAddEditForm;
