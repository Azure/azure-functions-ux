import { ActionButton, IButtonStyles, Icon, IIconProps, Link } from '@fluentui/react';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MonacoEditor from '../../../../../../components/monaco-editor/monaco-editor';
import { useStyles } from './Example.styles';
import { ExampleProps } from './Example.types';

const copyIconProps: IIconProps = {
  iconName: 'Copy',
};

const copyStyles: IButtonStyles = {
  root: {
    borderColor: 'transparent',
  },
};

const options = {
  folding: false,
  lineNumbers: 'off',
  minimap: {
    enabled: false,
  },
  readOnly: true,
  scrollBeyondLastLine: false,
};

const TestExample: React.FC<ExampleProps> = ({
  defaultLanguage,
  defaultValue,
  description,
  headerText,
  linkText,
  onLinkClick,
}: ExampleProps) => {
  const monacoEditorRef = useRef<MonacoEditor | null>();
  const styles = useStyles();
  const { t } = useTranslation();

  const onCopyClick = useCallback(() => {
    if (monacoEditorRef.current) {
      const { editor } = monacoEditorRef.current;
      editor.setSelection(editor.getModel().getFullModelRange());
      editor.focus();
      document.execCommand('copy');
    }
  }, []);

  const height = useMemo(() => {
    /** @note (joechung): Set height to 1.7 × the number of lines of code, capping lines to 3..10. */
    const lines = 1.7 * Math.max(3, Math.min(defaultValue.split('\n').length, 10));
    return `${lines}em`;
  }, [defaultValue]);

  return (
    <section className={styles.section}>
      <h1 className={styles.header}>{headerText}</h1>
      <p className={styles.description}>{description}</p>
      <div>
        <div className={styles.editor}>
          <MonacoEditor
            defaultLanguage={defaultLanguage}
            defaultValue={defaultValue}
            height={height}
            options={options}
            ref={editor => (monacoEditorRef.current = editor)}
          />
        </div>
        <div className={styles.actionBar}>
          <ActionButton iconProps={copyIconProps} styles={copyStyles} onClick={onCopyClick}>
            {t('copypre_copy')}
          </ActionButton>
          {onLinkClick && (
            <div className={styles.link}>
              <Link onClick={onLinkClick}>
                {linkText} <Icon iconName="NavigateExternalInline" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestExample;
