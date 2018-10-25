// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any;
declare module 'yaml-lint';

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
