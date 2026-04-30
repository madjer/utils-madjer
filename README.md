# ⚡ Utilitários Madjer

Ferramentas práticas para desenvolvedores — sem login, direto ao ponto.

**Acesse:** [madjer-utils.web.app](https://madjer-utils.web.app)

---

## 🛠 Ferramentas

### 🔵 Geradores

#### 🏢 Gerador de CNPJ
- Formato **normal** ou **alfanumérico** (nova regra Receita Federal 2026)
- Com ou sem pontuação
- Gere até 50 CNPJs de uma vez; copie individual ou todos

#### 👤 Gerador de CPF
- Dígitos verificadores calculados pelo algoritmo Módulo 11
- Com ou sem máscara; gere até 50 de uma vez

#### 🔑 Gerador de UUID
- UUID v4 via `crypto.randomUUID()`
- Opções: maiúsculas/minúsculas e com/sem hífens
- Gere até 50 UUIDs; copie individual ou todos

#### 🔒 Gerador de Senhas
- Comprimento configurável de 4 a 128 caracteres via slider
- Opções: maiúsculas, minúsculas, números, símbolos
- Gere até 50 senhas; copie individual ou todas

#### 🪪 Dados Fictícios
- Gera dados brasileiros falsos para testes: nome completo, e-mail, CPF, telefone, endereço, data de nascimento
- Exibe em tabela; exporta como JSON

#### 📍 Consulta de CEP
- Busca endereço completo via API [ViaCEP](https://viacep.com.br)
- Auto-formatação do campo CEP
- Copia resultado como JSON

---

### 🟡 Formatadores

#### `{}` Formatador de JSON
- Valida, indenta (pretty-print) ou minifica JSON
- Destaca erros de sintaxe com mensagem

#### 📄 Formatador de XML
- Indentação automática via `DOMParser`
- Modo **Escapado**: converte para uso como string em JSON

#### 🗄 Formatador de SQL
- Powered by [`sql-formatter`](https://github.com/sql-formatter-org/sql-formatter)
- Dialetos: SQL, MySQL, PostgreSQL, SQLite, T-SQL, PL/SQL
- Configuração de indentação (2 espaços, 4 espaços, tab)

#### 🗜 Minificador CSS / JS
- Remove espaços, quebras de linha e comentários
- Exibe percentual de redução do tamanho
- Modos: CSS e JavaScript

#### 📝 Markdown Viewer
- Preview em tempo real ao lado do editor
- Suporte a tabelas, código, blockquotes, listas e mais
- Copia o HTML gerado

#### 🔤 Formatador de Texto
| Grupo | Transformações |
|-------|---------------|
| Capitalização | UPPER CASE, lower case, Capitalize Words, Sentence case |
| Espaços/linhas | Remover espaços extras, quebras de linha, linhas vazias, ordenar, remover duplicatas |
| Caracteres | Remover acentos, especiais, números, pontuação |

---

### 🟢 Conversores

#### 🔄 JSON ↔ XML
- Converte JSON → XML e XML → JSON nos dois sentidos
- Detecção automática de arrays e objetos aninhados

#### 📊 JSON ↔ CSV
- Converte array JSON para CSV e CSV para array JSON
- Configuração de separador: vírgula, ponto-vírgula ou tab

#### 🔐 Base64
- Codifica e decodifica texto em Base64 (UTF-8 seguro)
- Upload de arquivo → Base64 direto no navegador

#### 📏 Conversor de Unidades
| Categoria | Unidades |
|-----------|---------|
| Comprimento | mm, cm, m, km, in, ft, mi |
| Peso | mg, g, kg, t, lb, oz |
| Temperatura | °C, °F, K |
| Dados | bit, B, KB, MB, GB, TB |
| Tempo | ms, s, min, h, dia, semana |

---

### 🟠 Codificação

#### 🔗 URL Encode / Decode
- Codifica e decodifica strings via `encodeURIComponent` / `decodeURIComponent`

#### `</>` HTML Entities
- Codifica/decodifica entidades HTML (`&amp;`, `&lt;`, `&gt;`, etc.)
- Tabela de referência com entidades comuns

#### `#` Hash (SHA)
- Gera SHA-1, SHA-256, SHA-384 e SHA-512 via `SubtleCrypto` (nativo do browser)
- Sem envio de dados para servidor

---

### 🔴 Dev Tools

#### ✅ Validador CPF / CNPJ
- Valida dígitos verificadores (Módulo 11)
- Auto-formatação do campo durante digitação
- Validação em lote: cole vários em sequência

#### 🗝 JWT Decoder
- Decodifica header, payload e signature de tokens JWT
- Indica se o token está expirado (`exp`)
- Exibe datas `iat` e `exp` legíveis

#### 💻 cURL → Código
- Converte comandos cURL em:
  - JavaScript com `fetch`
  - JavaScript com `axios`
  - Python com `requests`

---

## Stack

| Tecnologia | Uso |
|-----------|-----|
| **Angular 19** | Framework (standalone components, signals, lazy routes) |
| **Angular Material MDC** | UI components com tema M3 |
| **sql-formatter** | Formatação de SQL |
| **Firebase Hosting** | Deploy e CDN |

- 5 paletas de cores + modo claro/escuro, persistidos em `localStorage`
- Todas as operações são realizadas **localmente no navegador** — nenhum dado é enviado para servidores externos

---

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
ng serve

# Build de produção
ng build

# Deploy no Firebase
firebase deploy --only hosting
```

**Projeto Firebase:** `madjer-utils`  
**Repositório:** [github.com/madjer/utils-madjer](https://github.com/madjer/utils-madjer)
