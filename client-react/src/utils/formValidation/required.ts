const requiredValidation = (value: unknown, errorMessage: string): string | undefined => (!value ? errorMessage : undefined);

export default requiredValidation;
