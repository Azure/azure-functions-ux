// import * as React from 'react';
// import { connect } from 'react-redux';
// import MonacoEditor from '../../../../components/monaco-editor/monaco-editor';
// import { updateCurrentCode } from '../../../../modules/app/function-quick-create/actions';

// class Editor extends React.Component<any, any> {
//   constructor(props) {
//     super(props);
//     this.onChange = this.onChange.bind(this);
//   }
//   public editorDidMount(editor, monaco) {
//     console.log('editorDidMount', editor);
//     editor.focus();
//   }
//   public onChange(newValue, e) {
//     this.props.updateCode(newValue);
//   }
//   public render() {
//     const options = {
//       selectOnLineNumbers: true,
//     };
//     return (
//       <MonacoEditor
//         style={{ width: '100%', height: '100%' }}
//         language={this.props.language}
//         theme={this.props.theme === 'dark' ? 'vs-dark' : 'vs-light'}
//         value={this.props.code}
//         options={options}
//         onChange={this.onChange}
//         editorDidMount={this.editorDidMount}
//       />
//     );
//   }
// }

// const mapStateToProps = state => {
//   return {
//     code: state.functionQuickCreate.code,
//     language: state.functionQuickCreate.functionAppLanguage,
//     theme: state.portalService && state.portalService.startupInfo && state.portalService.startupInfo.theme,
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     updateCode: (code: string) => dispatch(updateCurrentCode(code)),
//   };
// };
// export default connect(
//   mapStateToProps,
//   mapDispatchToProps,
// )(Editor);
