export const getSortedItems = (items: any[], columnKey: string, isSortedDescending?: boolean) => [
  ...items.slice(0).sort((a: any, b: any) => ((isSortedDescending ? a[columnKey] < b[columnKey] : a[columnKey] > b[columnKey]) ? 1 : -1)),
];
