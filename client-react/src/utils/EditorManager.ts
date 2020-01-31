export enum EditorLanguage {
  bat = 'bat',
  csharp = 'csharp',
  fsharp = 'fsharp',
  javascript = 'javascript',
  json = 'json',
  powershell = 'powershell',
  python = 'python',
  typescript = 'typescript',
  markdown = 'markdown',
  php = 'php',
  shell = 'shell',
  plaintext = 'plaintext',
}

export default class EditorManager {
  public static getEditorLanguage(filename: string): EditorLanguage {
    const extension = filename
      .toLowerCase()
      .split('.')
      .pop();
    let language = EditorLanguage.plaintext;
    switch (extension) {
      case 'bat':
        language = EditorLanguage.bat;
        break;
      case 'csx':
        language = EditorLanguage.csharp;
        break;
      case 'fsx':
        language = EditorLanguage.fsharp;
        break;
      case 'js':
        language = EditorLanguage.javascript;
        break;
      case 'json':
        language = EditorLanguage.json;
        break;
      case 'ps1':
        language = EditorLanguage.powershell;
        break;
      case 'py':
        language = EditorLanguage.python;
        break;
      case 'ts':
        language = EditorLanguage.typescript;
        break;
      case 'md':
        language = EditorLanguage.markdown;
        break;
      case 'php':
        language = EditorLanguage.php;
        break;
      case 'sh':
        language = EditorLanguage.shell;
        break;
    }
    return language;
  }
}
