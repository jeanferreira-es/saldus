# Atualizações pelo EAS Update

Este projeto usa o **EAS Update** para mandar mudanças de código para o APK já
instalado no celular, **sem gerar um APK novo**. Também dá para testar o código de
uma branch de feature no mesmo APK de preview.

> Os comandos usam `npx eas-cli@latest`, que não precisa de instalação global.
> Para usar só `eas`, instale com `npm install -g eas-cli`.

## Como funciona

Um app Expo tem duas partes:

| Parte | O que contém | Como chega no celular |
|---|---|---|
| **Nativa** | código Android/iOS, bibliotecas nativas (`expo-sqlite`...), ícone, splash, plugins do `app.json` | só por **build** (`eas build`), ou seja, um APK novo |
| **JavaScript** | telas, regras de negócio, estilos, imagens usadas no código (todo o `src/`) | por **update** (`eas update`), sem APK novo |

Três conceitos ligam um APK aos updates:

- **Update:** um pacote com o JS e os assets, publicado com `eas update`.
- **Branch (do EAS):** uma lista de updates em ordem, como `preview` ou
  `feature-recorrencias`. Ela não é a branch do git, mas a convenção é usar o mesmo nome.
- **Channel:** um nome gravado no APK durante o build. O app pergunta ao EAS
  "qual o último update do meu channel?", e cada channel aponta para uma branch.

```
APK de preview ──(channel "preview")──► channel preview ──► branch "preview" ──► último update
                                                       └─► (ou qualquer branch para onde você apontar o channel)
```

### Quando o app aplica um update

Ao abrir, o app consulta o EAS e baixa o update novo em segundo plano. Ele é
aplicado **na próxima vez que o app for aberto**: feche o app por completo (tire da
lista de recentes) e abra de novo.

### Runtime version: o que impede um update de quebrar o app

Um update só é entregue a APKs com a mesma **runtime version**. O projeto usa a
política `fingerprint`: a runtime version é um hash de tudo que é nativo (dependências
nativas, `app.json`, plugins, patches). Na prática:

- Mudou só código em `src/`? O runtime não muda, e o update chega nos APKs já instalados.
- Instalou, removeu ou atualizou uma biblioteca nativa, ou mudou plugins, ícone ou
  splash no `app.json`? O runtime muda: os APKs antigos **não recebem** esse update
  e é preciso gerar um APK novo (veja [Quando gerar um APK novo](#quando-gerar-um-apk-novo)).

Para ver o runtime atual do projeto:

```bash
npx expo-updates fingerprint:generate --platform android
```

O campo `hash` é a runtime version. O painel do EAS mostra o runtime de cada build e
de cada update.

## Configuração atual do projeto

| Arquivo | Configuração |
|---|---|
| `package.json` | dependência `expo-updates` |
| `app.json` | `updates.url` apontando para o projeto no EAS e `runtimeVersion: { "policy": "fingerprint" }` |
| `eas.json` | um channel por perfil de build (tabela abaixo) |

| Perfil de build (`eas.json`) | Gera | Channel |
|---|---|---|
| `development` | APK com development client | `development` |
| `preview` | APK de distribuição interna | `preview` |
| `production` | build de loja | `production` |

> **APKs gerados antes desta configuração não recebem updates**, porque não têm o
> `expo-updates` nem um channel. É preciso gerar e instalar um APK de preview novo uma
> única vez (passo 1 abaixo).

## Passo a passo

### 1. Gerar o APK de preview (uma vez, ou quando o nativo mudar)

```bash
npx eas-cli@latest build --profile preview --platform android
```

Ao terminar, baixe o APK pelo link mostrado (ou pelo painel em expo.dev) e instale no
celular. O channel `preview` é criado no EAS automaticamente nesse primeiro build.

### 2. Publicar mudanças no preview

Com o código commitado:

```bash
npx eas-cli@latest update --branch preview --environment preview --message "Descrição da mudança"
```

A branch `preview` e o channel `preview` (ligado a ela) já existem no EAS. Depois de
publicar, abra o app duas vezes (a primeira baixa, a segunda aplica).

> `--environment` escolhe quais variáveis de ambiente do EAS entram no bundle. Use o
> mesmo nome do perfil de build. Em modo `--non-interactive` (CI) ele é obrigatório.

### 3. Testar uma branch de feature no mesmo APK

1. No git, na branch da feature, publique o update numa branch do EAS com o mesmo nome:

   ```bash
   npx eas-cli@latest update --branch feature-recorrencias --environment preview --message "WIP recorrências"
   ```

   Ou use `--auto`, que pega o nome da branch do git e a mensagem do último commit:

   ```bash
   npx eas-cli@latest update --auto --environment preview
   ```

2. Aponte o channel do APK de preview para a branch da feature:

   ```bash
   npx eas-cli@latest channel:edit preview --branch feature-recorrencias
   ```

3. Abra o app duas vezes: ele passa a rodar o código da feature.

4. Para voltar ao preview normal:

   ```bash
   npx eas-cli@latest channel:edit preview --branch preview
   ```

> O channel vale para **todos** os celulares com o APK de preview. Se outras pessoas
> usam o mesmo APK, elas também passam a ver a feature enquanto o channel apontar para ela.

### 4. Desfazer um update com problema

Liste os updates da branch e republique um anterior que funcionava:

```bash
npx eas-cli@latest update:list --branch preview
npx eas-cli@latest update:republish --group <id-do-grupo-que-funcionava>
```

O update republicado vira o mais recente da branch e os celulares voltam para ele na
próxima abertura.

## Quando gerar um APK novo

Gere um build novo (passo 1) sempre que mudar algo nativo:

- instalar, remover ou atualizar pacotes com código nativo (`npx expo install ...`,
  `expo-*`, `react-native-*`);
- atualizar o SDK do Expo;
- mudar plugins, ícone, splash, nome, `package` ou permissões no `app.json`;
- mudar os patches/vendor nativos (ex.: o patch do `expo-sqlite`).

Se você publicar um update depois de uma mudança dessas sem gerar o build, nada
quebra: o update fica com um runtime que nenhum APK instalado tem, e só passa a valer
quando um APK com esse runtime for instalado.

## Cuidado: banco de dados

As migrações do SQLite (`src/database/index.ts`) estão no JavaScript, então **um
update pode migrar o banco no celular**. Antes de publicar uma migração:

- teste no APK de preview antes de usar o channel `production`;
- lembre que desfazer o update (passo 4) volta o código, mas **não desfaz a migração**
  já aplicada no banco. O código antigo precisa funcionar com o schema novo.

## Comandos rápidos

| Objetivo | Comando |
|---|---|
| Gerar APK de preview | `npx eas-cli@latest build --profile preview --platform android` |
| Publicar no preview | `npx eas-cli@latest update --branch preview --environment preview --message "..."` |
| Publicar a branch atual do git | `npx eas-cli@latest update --auto --environment preview` |
| Apontar o APK de preview para uma feature | `npx eas-cli@latest channel:edit preview --branch <branch>` |
| Ver channels e para onde apontam | `npx eas-cli@latest channel:list` |
| Ver branches | `npx eas-cli@latest branch:list` |
| Ver updates de uma branch | `npx eas-cli@latest update:list --branch <branch>` |
| Republicar um update anterior | `npx eas-cli@latest update:republish --group <id>` |
| Ver o runtime atual | `npx expo-updates fingerprint:generate --platform android` |

## Configurar do zero (referência)

Passos que já foram feitos neste projeto, para repetir em outro:

1. Instalar o `expo-updates` na versão compatível com o SDK:

   ```bash
   npx expo install expo-updates
   ```

2. Configurar o EAS Update (adiciona `updates.url` e `runtimeVersion` ao `app.json`
   e um `channel` para cada perfil do `eas.json`):

   ```bash
   npx eas-cli@latest update:configure --platform android
   ```

3. Trocar a política do `runtimeVersion` para `fingerprint`. O comando acima configura
   `appVersion`, que depende de você aumentar o `version` do `app.json` a cada mudança
   nativa. Como neste projeto o `version` fica fixo (o número do build é incrementado
   remotamente), `fingerprint` é mais seguro:

   ```json
   "runtimeVersion": { "policy": "fingerprint" }
   ```

4. Criar o channel e a branch no EAS. O primeiro `eas update --branch preview` cria a
   branch; em modo interativo ele também cria o channel. Se o channel não existir
   (`channel:list` vazio), crie e ligue à branch de mesmo nome com:

   ```bash
   npx eas-cli@latest channel:create preview
   ```

5. Gerar e instalar um APK novo (passo 1 do passo a passo).
