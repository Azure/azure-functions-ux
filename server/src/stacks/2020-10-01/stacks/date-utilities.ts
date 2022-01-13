export const getDateString = (date: Date, useIsoDateFormat: boolean) => {
  if (!date) {
    return '';
  }

  return useIsoDateFormat ? date.toISOString() : date.toString();
};
