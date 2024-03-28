export const toPercentString = (value: number): string => {
  return value.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 });
}