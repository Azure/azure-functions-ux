import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as PropTypes from 'prop-types';
import React from 'react';
import { editorStyle, disabledEditorStyle } from './monaco-editor.styles';
import { PortalTheme } from '../../models/portal-models';

class MonacoEditor extends React.Component<any, any> {
  public static propTypes: any;
  public static defaultProps: any;
  public containerElement: any = undefined;
  public editor: any = null;
  private currentValue: any = null;
  private preventTriggerChangeEvent: any = null;
  constructor(props) {
    super(props);
    this.currentValue = props.value;
  }

  public componentDidMount() {
    this.initMonaco();
    setInterval(() => {
      this.updateDimensions();
    }, 300);
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  public componentDidUpdate(prevProps) {
    if (this.props.value !== this.currentValue) {
      // Always refer to the latest value
      this.currentValue = this.props.value;
      // Consider the situation of rendering 1+ times before the editor mounted
      if (this.editor) {
        this.preventTriggerChangeEvent = true;
        this.editor.setValue(this.currentValue);
        this.preventTriggerChangeEvent = false;
      }
    }
    if (prevProps.language !== this.props.language) {
      monaco.editor.setModelLanguage(this.editor.getModel(), this.props.language);
    }
    if (prevProps.theme !== this.props.theme) {
      monaco.editor.setTheme(this.props.theme);
    }

    if (this.editor.updateOptions) {
      this.editor.updateOptions({ ...this.props.options });
    }

    if (this.props.onSave && this.editor.addCommand) {
      this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
        this.props.onSave();
      });
    }

    this.editor.layout();
  }

  public componentWillUnmount() {
    this.destroyMonaco();
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  public editorWillMount() {
    const { editorWillMount } = this.props;
    editorWillMount(monaco);
  }

  public editorDidMount(editor) {
    this.props.editorDidMount(editor, monaco);
    editor.onDidChangeModelContent(event => {
      const value = editor.getValue();

      // Always refer to the latest value
      this.currentValue = value;

      // Only invoking when user input changed
      if (!this.preventTriggerChangeEvent) {
        this.props.onChange(value, event);
      }
    });
  }

  public initMonaco() {
    const value = this.props.value !== null ? this.props.value : this.props.defaultValue;
    const { language, theme, options } = this.props;
    if (this.containerElement) {
      // Before initializing monaco editor
      this.editorWillMount();
      this.editor = monaco.editor.create(this.containerElement, {
        value,
        language,
        ...options,
      });
      if (theme) {
        monaco.editor.setTheme(theme);
      }
      if (options && options.hideReadOnlyTooltip) {
        this.editor.onKeyDown(e => {
          if (!!e) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }
      // After initializing monaco editor
      this.editorDidMount(this.editor);
    }
  }

  public destroyMonaco() {
    if (typeof this.editor !== 'undefined') {
      this.editor.dispose();
    }
  }

  public assignRef = component => {
    this.containerElement = component;
  };

  public render() {
    const { height } = this.props;
    return <div ref={this.assignRef} className={`${editorStyle(height)} ${this.props.disabled ? disabledEditorStyle : ''}`} />;
  }

  public updateDimensions() {
    this.editor.layout();
  }
}

export const getMonacoEditorTheme = (portalTheme: PortalTheme) => {
  return `vs-${portalTheme}`;
};

MonacoEditor.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  language: PropTypes.string,
  theme: PropTypes.string,
  options: PropTypes.object,
  editorDidMount: PropTypes.func,
  editorWillMount: PropTypes.func,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  height: PropTypes.string,
};
const noop = () => {
  return;
};
MonacoEditor.defaultProps = {
  value: null,
  defaultValue: '',
  language: 'javascript',
  theme: 'vs-light',
  options: {},
  editorDidMount: noop,
  editorWillMount: noop,
  onChange: noop,
  disabled: false,
  height: 'calc(100vh - 100px)',
};

export default MonacoEditor;
