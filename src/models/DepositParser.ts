/**
 * MODEL LAYER
 * Regras de negócio dos depósitos detectados pelas notificações dos bancos:
 * extrai valor e remetente do texto e decide o que fazer com cada um.
 * Cada banco escreve de um jeito, então os padrões são genéricos
 * ("Você recebeu um Pix de R$ 50,00 de FULANO", "FULANO te enviou R$ 50,00", ...).
 */
import { BankDepositSettings, BankDepositStatus, SenderRule } from "./types";

export interface ParsedDeposit {
  amount: number;
  sender: string; // "" quando o texto não traz o nome
}

const INCOMING = /receb(eu|ido|ida|imento)|te (enviou|mandou|transferiu)|caiu na (sua )?conta/i;
const AMOUNT = /R\$\s?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/;
// Sem flag "i": os nomes costumam vir em maiúsculas e as palavras de ligação em minúsculas.
const STOP = String.raw`(?=\s+(?:via|por|pelo|pela|no|na|em|com|para|às|as)\b|\s+-\s|[.,!;:\n(]|$)`;
const SENDER_AFTER_AMOUNT = new RegExp(String.raw`^[ ,]*(?:[Dd]e|[Dd]o|[Dd]a) +(.+?)` + STOP);
const SENDER_BEFORE_AMOUNT = /\b(?:[Dd]e|[Dd]o|[Dd]a) +([^\d$\n]+?) +(?:no valor de +|de +)?R\$/;
// CPF/CNPJ, inteiros ou mascarados ("***.123.456-**"), que alguns bancos colocam junto do nome.
const DOCUMENT = /\S*\*\S*|\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g;
const SENDER_SENT = /^(.+?)\s+(?:te\s+)?(?:enviou|mandou|transferiu)\b/m;

export class DepositParser {
  static parse(title: string, text: string): ParsedDeposit | null {
    const full = `${title}\n${text}`.replace(DOCUMENT, " ").replace(/ {2,}/g, " ");
    if (!INCOMING.test(full)) return null;

    const amountMatch = AMOUNT.exec(full);
    if (!amountMatch) return null;
    const amount = parseFloat(amountMatch[1].replace(/\./g, "").replace(",", "."));
    if (!(amount > 0)) return null;

    const afterAmount = full.slice(amountMatch.index + amountMatch[0].length);
    const candidates = [
      SENDER_AFTER_AMOUNT.exec(afterAmount)?.[1],
      SENDER_BEFORE_AMOUNT.exec(full)?.[1],
      SENDER_SENT.exec(full)?.[1],
    ];
    const sender = candidates.map((c) => (c ? cleanSender(c) : "")).find(Boolean) ?? "";
    return { amount, sender };
  }

  /** Maiúsculas, sem acento e com espaços simples — para comparar nomes. */
  static normalizeName(name: string): string {
    return name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Regra do remetente. Aceita nome abreviado de qualquer lado (os bancos às vezes
   * cortam o sobrenome) e, havendo mais de uma, fica com a mais específica.
   */
  static matchRule(sender: string, rules: SenderRule[]): SenderRule | undefined {
    const normalized = this.normalizeName(sender);
    if (!normalized) return undefined;
    return rules
      .filter((rule) => {
        const name = this.normalizeName(rule.name);
        return (
          name === normalized || normalized.startsWith(`${name} `) || name.startsWith(`${normalized} `)
        );
      })
      .sort((a, b) => b.name.length - a.name.length)[0];
  }

  static decide(sender: string, settings: BankDepositSettings): BankDepositStatus {
    const rule = this.matchRule(sender, settings.senderRules);
    if (rule) return rule.action;
    return settings.unknownSender === "ask" ? "pending" : settings.unknownSender;
  }

  /** "FULANO DE TAL" → "Fulano de Tal", para exibir e registrar empréstimos. */
  static displayName(sender: string): string {
    return sender
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
      .replace(/(^|\s)(\p{L})/gu, (match, space: string, letter: string) => space + letter.toUpperCase())
      .replace(/ (Da|De|Do|Das|Dos|E) /g, (word) => word.toLowerCase());
  }
}

function cleanSender(raw: string): string {
  const sender = raw.replace(/\s+/g, " ").trim();
  if (sender.length < 2 || /^(um|uma|voc[eê]|sua|seu)\b/i.test(sender)) return "";
  return sender.slice(0, 60);
}
