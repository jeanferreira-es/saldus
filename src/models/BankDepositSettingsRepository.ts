/**
 * MODEL LAYER — persistência das preferências de depósitos automáticos
 * (bancos monitorados, regras por pessoa e o que fazer com desconhecidos).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BankDepositSettings } from "./types";

const STORAGE_KEY = "@meudinheiro:bank_deposit_settings";

export const DEFAULT_BANK_DEPOSIT_SETTINGS: BankDepositSettings = {
  enabledBanks: [],
  senderRules: [],
  unknownSender: "ask",
};

export class BankDepositSettingsRepository {
  static async get(): Promise<BankDepositSettings> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BANK_DEPOSIT_SETTINGS;
    try {
      return { ...DEFAULT_BANK_DEPOSIT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_BANK_DEPOSIT_SETTINGS;
    }
  }

  static async set(settings: BankDepositSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}
