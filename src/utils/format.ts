export function formatInr(value: number) {
  return `INR ${Math.round(value).toLocaleString('en-IN')}`;
}

export function formatSignedInr(value: number) {
  const prefix = value >= 0 ? '+' : '-';
  return `${prefix}INR ${Math.abs(Math.round(value)).toLocaleString('en-IN')} today`;
}

export function formatPercent(value: number) {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}
