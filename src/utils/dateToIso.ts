export function dateToIsoString(value: Date): string {
  return value.toISOString().split("T")[0];
}
