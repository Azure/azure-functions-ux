import React, { useState, useEffect, useContext } from 'react';
import { MonacoLanguage } from './MonacoEditor.types';
import { editorStyle, disabledEditorStyle } from './monaco-editor.styles';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { StartupInfoContext } from '../../StartupInfoContext';

interface MonacoEditorProps {
  value: string;
  onChange: (newValue: any, e: any) => void;
  options?: {};
  height?: string;
  disabled?: boolean;
  language?: MonacoLanguage;
}

const MonacoEditor: React.FC<MonacoEditorProps> = props => {
  const { height = 'calc(100vh - 100px)', language = MonacoLanguage.plaintext, options = {}, onChange, value, disabled } = props;

  const [editor, setEditor] = useState<any>(undefined);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | undefined>(undefined);
  const [preventTriggerChangeEvent, setPreventTriggerChangeEvent] = useState(false);

  const startUpInfoContext = useContext(StartupInfoContext);

  const assignRef = ref => {
    if (!!ref) {
      setContainerElement(ref);
    }
  };

  const getTheme = () => {
    return `vs-${startUpInfoContext.theme}`;
  };

  const initEditor = () => {
    if (containerElement) {
      const editor = monaco.editor.create(containerElement, {
        value,
        language,
        ...options,
      });

      monaco.editor.setTheme(getTheme());
      editor.onDidChangeModelContent(e => {
        if (!preventTriggerChangeEvent) {
          onChange(value, e);
        }
      });

      setUpdatedEditor(editor);
    }
  };

  const updateValue = () => {
    if (editor) {
      setPreventTriggerChangeEvent(true);
      const updatedEditor = editor;
      updatedEditor.setValue(value);
      setUpdatedEditor(updatedEditor);
      setPreventTriggerChangeEvent(false);
    }
  };

  const updateLanguage = () => {
    if (editor) {
      monaco.editor.setModelLanguage(editor.getModel(), language);
    }
  };

  const updateOptions = () => {
    if (editor && editor.updateOptions) {
      const updatedEditor = editor;
      updatedEditor.updateOptions({ ...options });
      setUpdatedEditor(updatedEditor);
    }
  };

  const setUpdatedEditor = editor => {
    if (editor) {
      editor.layout();
      setEditor(editor);
    }
  };

  useEffect(() => {
    return () => {
      if (editor) {
        editor.dispose();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  useEffect(() => {
    updateLanguage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (!editor) {
      initEditor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerElement]);

  useEffect(() => {
    updateValue();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <div ref={assignRef} className={`${editorStyle(height)} ${disabled ? disabledEditorStyle : ''}`} />;
};

export default MonacoEditor;
