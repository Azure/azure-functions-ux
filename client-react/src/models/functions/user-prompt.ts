export interface UserPrompt {
  id: string;
  help: string | null;
  label: string | null;
  name: string;
  required: boolean;
  validators: Validator[];
  value: string | null;
  defaultValue?: unknown;
  enum?: Enum[];
  placeholder?: string;
  resource?: string;
}

interface Enum {
  display: string;
  value: string;
}

interface Validator {
  errorText: string;
  expression: string;
}
