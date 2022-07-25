export type Code = Pick<ExampleProps, 'defaultLanguage' | 'defaultValue'>;

export interface ExampleProps {
  defaultLanguage: string;
  defaultValue: string;
  description: string;
  headerText: string;
  linkText: string;
  onLinkClick(): void;
}

export interface Examples<T> {
  input?: T;
  output?: T;
  trigger?: T;
}
