/**
 * MODEL LAYER
 * Apps de banco que podem ser monitorados. O id é o nome do pacote no Android —
 * é por ele que o serviço nativo filtra as notificações.
 */
export interface Bank {
  id: string;
  name: string;
}

export const BANKS: Bank[] = [
  { id: "com.nu.production", name: "Nubank" },
  { id: "br.com.intermedium", name: "Inter" },
  { id: "com.itau", name: "Itaú" },
  { id: "com.bradesco", name: "Bradesco" },
  { id: "br.com.bb.android", name: "Banco do Brasil" },
  { id: "br.com.gabba.Caixa", name: "Caixa" },
  { id: "com.santander.app", name: "Santander" },
  { id: "com.c6bank.app", name: "C6 Bank" },
  { id: "com.picpay", name: "PicPay" },
  { id: "com.mercadopago.wallet", name: "Mercado Pago" },
  { id: "br.com.uol.ps.myaccount", name: "PagBank" },
];

export function bankName(id: string): string {
  return BANKS.find((b) => b.id === id)?.name ?? id;
}
