export class GitHubFileSearchMockData {
  public static readonly baseRootFolder = [
    {
      path: '.gitignore',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 532,
      url: 'https://api.github.com/url',
    },
    {
      path: 'README.md',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 2070,
      url: 'https://api.github.com/url',
    },
    {
      path: 'src',
      mode: '040000',
      type: 'tree',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      url: 'https://api.github.com/srcFolder',
    },
    {
      path: 'client',
      mode: '040000',
      type: 'tree',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      url: 'https://api.github.com/clientFolder',
    },
    {
      path: 'tslint.json',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 2592,
      url: 'https://api.github.com/url',
    },
  ];

  public static readonly srcFolder = [
    {
      path: 'App.css',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 667,
      url: 'https://api.github.com/url',
    },
    {
      path: 'App.tsx',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 4495,
      url: 'https://api.github.com/url',
    },
    {
      path: 'test.tsx',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 1787,
      url: 'https://api.github.com/url',
    },
    {
      path: 'models.ts',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 285,
      url: 'https://api.github.com/url',
    },
  ];

  public static readonly clientFolder = [
    {
      path: '.test',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 17,
      url: 'https://api.github.com/url',
    },
    {
      path: 'favicon.ico',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 17,
      url: 'https://api.github.com/url',
    },
    {
      path: 'index.html',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 17,
      url: 'https://api.github.com/url',
    },
    {
      path: 'manifest.json',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 17,
      url: 'https://api.github.com/url',
    },
    {
      path: 'fileNameToLookFor.config.json',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 103,
      url: 'https://api.github.com/url',
    },
  ];

  public static readonly baseClientFolder = [
    {
      path: 'src',
      mode: '040000',
      type: 'tree',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      url: 'https://api.github.com/srcFolder',
    },
    {
      path: 'public',
      mode: '040000',
      type: 'tree',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      url: 'https://api.github.com/publicFolder',
    },
    {
      path: 'tslint.json',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 2592,
      url: 'https://api.github.com/url',
    },
  ];

  public static readonly publicFolder = [
    {
      path: 'publicSub1',
      mode: '040000',
      type: 'tree',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      url: 'https://api.github.com/publicSub1Folder',
    },
    {
      path: 'publicSub2',
      mode: '040000',
      type: 'tree',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      url: 'https://api.github.com/publicSub2Folder',
    },
    {
      path: 'publicSub3',
      mode: '040000',
      type: 'tree',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      url: 'https://api.github.com/publicSub3Folder',
    },
  ];

  public static readonly publicSub1Folder = [
    {
      path: '.test',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 17,
      url: 'https://api.github.com/url',
    },
    {
      path: 'test.ico',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 17,
      url: 'https://api.github.com/url',
    },
  ];

  public static readonly publicSub2Folder = [
    {
      path: 'test.txt',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 17,
      url: 'https://api.github.com/url',
    },
    {
      path: 'unitTest.ico',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 17,
      url: 'https://api.github.com/url',
    },
  ];

  public static readonly publicSub3Folder = [
    {
      path: 'test.txt',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 17,
      url: 'https://api.github.com/url',
    },
    {
      path: 'fileNameToLookFor.config.json',
      mode: '100644',
      type: 'blob',
      sha: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      size: 103,
      url: 'https://api.github.com/url',
    },
  ];
}
