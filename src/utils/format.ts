export function digitsToMoneyMask(text: string): string {
  const digits = text.replace(/\D/g, "");
  const cents = digits === "" ? 0 : parseInt(digits, 10);
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function moneyMaskToNumber(masked: string): number {
  const digits = masked.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Converte um número (ex: 12.5) para o formato da máscara de valor ("12,50"). */
export function numberToMoneyMask(value: number): string {
  return digitsToMoneyMask(String(Math.round(value * 100)));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatMonthLabel(date: Date): string {
  const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
