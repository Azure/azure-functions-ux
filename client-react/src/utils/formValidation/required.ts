const requiredValidation = (value: any, errorMessage: string) => {
  let error;
  if (!value) {
    error = errorMessage;
  }
  return error;
};
export default requiredValidation;
