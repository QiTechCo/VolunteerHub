export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhone(value?: string | null) {
  if (!value) return "";
  const d = digitsOnly(value);
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return value;
}
