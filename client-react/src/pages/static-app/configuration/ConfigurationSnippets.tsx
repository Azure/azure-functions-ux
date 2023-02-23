import { useCallback, useMemo, useContext, useEffect } from 'react';
import { Link, ProgressIndicator } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';
import { Checkbox } from '@fluentui/react';
import { Links } from '../../../utils/FwLinks';
import { useStyles } from './Configuration.styles';
import { ConfigurationSnippetsProps } from './Configuration.types';
import { Field } from 'formik';
import ConfigurationEnvironmentSelector from './ConfigurationEnvironmentSelector';
import { ArmObj } from '../../../models/arm-obj';
import { Environment } from '../../../models/static-site/environment';
import MonacoEditor, { getMonacoEditorTheme } from '../../../components/monaco-editor/monaco-editor';
import { StartupInfoContext } from '../../../StartupInfoContext';
import { PortalTheme } from '../../../models/portal-models';
import { editorStyle } from '../../app/functions/function/function-editor/FunctionEditor.styles';
import { bodyEditorStyle } from '../../app/functions/function/function-editor/function-test/FunctionTest.styles';
import { EditorLanguage } from '../../../utils/EditorManager';

const ConfigurationSnippets: React.FC<ConfigurationSnippetsProps> = ({ isLoading, formProps, disabled }: ConfigurationSnippetsProps) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const startUpInfoContext = useContext(StartupInfoContext);
  const monacoEditorHeight = 'calc(35vh - 100px)';

  const onSnippetsEnvironmentCheckboxChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, checked: boolean) => {
      formProps.setFieldValue('snippetsApplyToAllEnvironments', checked);
    },
    [formProps]
  );

  const onEnvironmentDropdownChange = useCallback(
    (environment: ArmObj<Environment>) => {
      formProps.setFieldValue('snippetsEnvironment', environment);
    },
    [formProps]
  );

  const onHeadContentChange = useCallback(
    (headContent: string) => {
      formProps.setFieldValue('snippetsHeadContent', headContent);
      console.log(headContent);
    },
    [formProps]
  );

  const onBodyContentChange = useCallback(
    (bodyContent: string) => {
      formProps.setFieldValue('snippetsBodyContent', bodyContent);
      console.log(bodyContent);
    },
    [formProps]
  );

  useEffect(() => {
    const isDirty =
      formProps.values.snippetsApplyToAllEnvironments !== formProps.initialValues.snippetsApplyToAllEnvironments ||
      formProps.values.snippetsEnvironment !== formProps.initialValues.snippetsEnvironment ||
      formProps.values.snippetsHeadContent !== formProps.initialValues.snippetsHeadContent ||
      formProps.values.snippetsBodyContent !== formProps.initialValues.snippetsBodyContent;
    formProps.setFieldValue('isSnippetsDirty', isDirty);

    /** @note (joechung): Formik 1.x `formProps` do not work as a `useEffect` dependency. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formProps.values.snippetsApplyToAllEnvironments,
    formProps.values.snippetsEnvironment,
    formProps.values.snippetsHeadContent,
    formProps.values.snippetsBodyContent,
  ]);

  const showEnvironmentDropdown = useMemo<boolean>(() => {
    return !formProps.values.snippetsApplyToAllEnvironments;
  }, [formProps.values.snippetsApplyToAllEnvironments]);

  return (
    <div className={styles.formElement}>
      {isLoading ? (
        <ProgressIndicator description={t('staticSite_loadingSnippets')} ariaValueText={t('staticSite_loadingSnippets')} />
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.description}>
              <span id="snippets-description">{t('staticSite_SnippetsDescription')} </span>
              <Link
                aria-labelledby="snippets-description"
                className={learnMoreLinkStyle}
                href={Links.staticSiteSnippetsLearnMore}
                target="_blank">
                {t('learnMore')}
              </Link>
            </div>

            <Field
              checked={formProps.values.snippetsApplyToAllEnvironments}
              component={Checkbox}
              customLabelClassName={styles.customLabel}
              customLabelStackClassName={styles.customLabelStack}
              disabled={disabled}
              id="snippets-apply-to-all-environments"
              label={t('staticSite_appliesToEnvironments')}
              name="snippetsApplyToAllEnvironments"
              onChange={onSnippetsEnvironmentCheckboxChange}
              styles={styles.toggle}
            />

            {showEnvironmentDropdown && (
              <ConfigurationEnvironmentSelector
                environments={formProps.values.environments || []}
                onDropdownChange={onEnvironmentDropdownChange}
                disabled={disabled}
                selectedEnvironment={formProps.values.snippetsEnvironment}
                isLoading={isLoading}
              />
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.header}>{t('staticSite_head')}</h3>
            <div className={styles.description}>
              <span id="snippets-head-description">{t('staticSite_headAndBodyDescription').format(`<head>`)} </span>
            </div>
            <div className={bodyEditorStyle}>
              <MonacoEditor
                value={formProps.values.snippetsHeadContent}
                language="html"
                onChange={onHeadContentChange}
                height={monacoEditorHeight}
                disabled={disabled}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  cursorBlinking: true,
                  renderWhitespace: 'all',
                  extraEditorClassName: editorStyle,
                }}
                theme={getMonacoEditorTheme(startUpInfoContext.theme as PortalTheme)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.header}>{t('staticSite_body')}</h3>
            <div className={styles.description}>
              <span id="snippets-body-description">{t('staticSite_headAndBodyDescription').format(`<body>`)} </span>
            </div>
            <div className={bodyEditorStyle}>
              <MonacoEditor
                value={formProps.values.snippetsBodyContent}
                language={EditorLanguage.markdown}
                onChange={onBodyContentChange}
                height={monacoEditorHeight}
                disabled={disabled}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  cursorBlinking: true,
                  renderWhitespace: 'all',
                  extraEditorClassName: editorStyle,
                }}
                theme={getMonacoEditorTheme(startUpInfoContext.theme as PortalTheme)}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ConfigurationSnippets;
