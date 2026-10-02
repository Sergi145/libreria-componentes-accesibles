const collator = new Intl.Collator('es', { numeric: true });

export function getSortValue(cell) {
  return (
    cell?.getAttribute('data-sort-value') ?? cell?.textContent.trim() ?? ''
  );
}

export function compareSortValues(a, b, type) {
  if (type === 'number') {
    return Number(a) - Number(b);
  }
  return collator.compare(a, b);
}
