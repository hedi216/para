const formatter = new Intl.NumberFormat('fr-TN', {
  style: 'currency',
  currency: 'TND',
  minimumFractionDigits: 3,
});

export function formatPrice(value: number | string) {
  return formatter.format(Number(value)).replace('TND', 'DT');
}
