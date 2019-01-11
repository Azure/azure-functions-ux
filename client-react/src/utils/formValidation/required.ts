const requiredValidation = (value: unknown, errorMessage: string) => {
  let error;
  if (!value) {
    error = errorMessage;
  }
  return error;
};
export default requiredValidation;
