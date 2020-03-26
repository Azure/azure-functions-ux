export const getDateAfterXSeconds = (seconds: number): Date => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};
