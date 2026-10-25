/**
 * Ponte JS para o módulo nativo (só Android) que lê as notificações dos apps de banco.
 * No iOS/web o módulo não existe e tudo aqui vira no-op.
 */
import { requireOptionalNativeModule } from "expo";

export interface RawBankNotification {
  id: string;
  packageName: string;
  title: string;
  text: string;
  postedAt: number; // epoch ms
}

type BankNotificationsNative = {
  isPermissionGranted(): boolean;
  openPermissionSettings(): void;
  setAllowedPackages(packages: string[]): void;
  drain(): string;
  addListener(event: "onNotification", listener: () => void): { remove(): void };
};

const native = requireOptionalNativeModule<BankNotificationsNative>("BankNotifications");

export const isSupported = native != null;

export function isPermissionGranted(): boolean {
  return native?.isPermissionGranted() ?? false;
}

export function openPermissionSettings(): void {
  native?.openPermissionSettings();
}

export function setAllowedPackages(packages: string[]): void {
  native?.setAllowedPackages(packages);
}

/** Retira da fila nativa tudo o que foi capturado desde a última chamada. */
export function drain(): RawBankNotification[] {
  if (!native) return [];
  try {
    return JSON.parse(native.drain());
  } catch {
    return [];
  }
}

export function addNotificationListener(listener: () => void): { remove(): void } {
  return native?.addListener("onNotification", listener) ?? { remove() {} };
}
