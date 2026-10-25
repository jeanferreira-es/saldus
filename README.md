# Saldus 🍊

App de controle financeiro pessoal em **React Native + Expo (TypeScript)**, com
**arquitetura MVC**, estilização em **styled-components** e persistência em
**SQLite** (`expo-sqlite`).

## Funcionalidades

- **Saldo**: acompanhe o saldo atual e adicione entradas de dinheiro.
- **Saídas por categoria**: registre despesas (Alimentação, Moradia, Transporte...).
- **À vista, recorrente ou parcelada**: compras recorrentes e parceladas são cadastradas
  uma vez e o app **lança automaticamente** a ocorrência de cada mês. Isso alimenta o
  cálculo de **quanto já está comprometido no próximo mês** (recorrentes ativas +
  parcelas que ainda caem no mês seguinte).
- **Cancelar recorrência**: pelo menu do lançamento ou tocando no card "Comprometido"
  na tela inicial. Os lançamentos já feitos continuam no histórico.
- **Empréstimos**: o que você **emprestou** (a receber) e o que **pegou emprestado**
  (a pagar), com pessoa, valor, vencimento e status de quitação.
- **Tema claro / escuro / automático**, em tons de laranja.
- **Animações**: fade + slide nos cartões e itens de lista ao aparecer, feedback de
  escala ao tocar em botões/chips, e transição animada no controle segmentado.
- Tudo salvo localmente no aparelho — não depende de servidor.

## Arquitetura (MVC)

React Native não tem um MVC "de fábrica", então a divisão foi adaptada assim:

```
src/
  models/          → MODEL: entidades, regras de negócio e persistência
    types.ts             tipos do domínio (Transaction, Loan, categorias)
    FinanceCalculator.ts regras de negócio puras (saldo, comprometido, totais)
    RecurrenceCalculator.ts   regras de compras recorrentes/parceladas (datas, comprometido)
    TransactionRepository.ts  acesso ao SQLite para transações
    LoanRepository.ts         acesso ao SQLite para empréstimos
    RecurrenceRepository.ts   acesso ao SQLite para recorrências + geração dos lançamentos mensais
    ThemeRepository.ts        acesso ao AsyncStorage para a preferência de tema

  controllers/     → CONTROLLER: ponte entre Model e View
    FinanceController.tsx  estado de transações/empréstimos + ações (Context)
    ThemeController.tsx    estado do tema + ações (Context)

  views/           → VIEW: tudo que é tela e componente visual
    screens/        telas (Home, Transações, Empréstimos, Ajustes, formulários)
    components/     componentes reutilizáveis (Card, itens de lista, animações)
    navigation/      configuração de rotas (tabs + stacks)
    theme/           paleta de cores e tipagem do tema do styled-components

  utils/           → funções puras de apoio (formatação de moeda/data)
```

**Regra de dependência:** as *Views* só falam com os *Controllers* (via hooks
`useFinanceController()` / `useThemeController()`); os *Controllers* são os
únicos que chamam os *Models* (repositórios e `FinanceCalculator`); e os
*Models* nunca importam nada de `views/` ou `controllers/`. Isso mantém a
lógica de negócio e a persistência completamente independentes da interface —
dá para trocar toda a UI sem tocar em `models/`.

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) e o app **Expo Go** no celular
(ou um emulador Android/iOS).

```bash
# 1. Instale as dependências
npm install

# 2. (Recomendado) garanta que as versões nativas batem com o SDK do Expo
npx expo install --fix

# 3. Rode o projeto
npx expo start
```

Escaneie o QR code com o **Expo Go** (Android) ou a câmera (iOS), ou aperte
`a` / `i` no terminal para abrir num emulador.

## Atualizações sem gerar APK (EAS Update)

Mudanças de código podem ser enviadas direto para o APK instalado, e branches de
feature podem ser testadas no APK de preview. Veja [EAS_UPDATE.md](EAS_UPDATE.md).

## Depósitos automáticos (Android)

Em **Ajustes → Depósitos pelo banco** o app passa a ler as notificações de Pix/transferência
recebidos nos bancos escolhidos e registra cada entrada conforme a pessoa que enviou:
**saldo** (receita), **me emprestou** (empréstimo a pagar), **me pagou** (abate do que
emprestei) ou **ignorar**. Remetentes sem regra ficam aguardando revisão (ou entram direto
como saldo / são ignorados, conforme a preferência). Saídas continuam manuais.

- Serviço nativo: [modules/bank-notifications](modules/bank-notifications) (`NotificationListenerService`).
  Só guarda notificações dos pacotes escolhidos que mencionem "R$"; o resto é descartado na hora.
- Leitura do texto: `src/models/DepositParser.ts` · lista de bancos: `src/models/banks.ts`.
- Exige build nativa (`eas build`) — não funciona no Expo Go nem no iOS.
- Android 13+ com APK instalado fora da loja: se o acesso às notificações aparecer bloqueado,
  vá em *Informações do app → ⋮ → Permitir configurações restritas*.

## Personalizando
ß
- **Cores**: `src/views/theme/palette.ts` (`lightPalette` / `darkPalette`).
- **Categorias**: `EXPENSE_CATEGORIES` / `INCOME_CATEGORIES` em `src/models/types.ts`.
- **Regras de negócio** (ex: como o "comprometido no próximo mês" é calculado):
  `src/models/FinanceCalculator.ts`.
- **Ícone/Splash**: a fonte é `assets/logo/mark.svg`; edite-a e rode `npm run icons`
  para regerar os PNGs em `assets/` (ícone, adaptive icon, splash e favicon).

## Próximos passos sugeridos

- Gráficos de gastos por categoria.
- Notificações locais lembrando de parcelas e empréstimos perto do vencimento.
- Exportar/backup dos dados (JSON) ou sincronizar em nuvem.˜`
