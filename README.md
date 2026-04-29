# ⚡ Utilitários Madjer

Ferramentas práticas para desenvolvedores — sem login, direto ao ponto.

**Acesse:** [util.madjer.com.br](https://util.madjer.com.br)

## Funcionalidades

### 🏢 Gerador de CNPJ
- Formato **normal** ou **alfanumérico** (nova regra Receita Federal 2026)
- Com ou sem pontuação
- Gere até 50 CNPJs de uma vez
- Copiar individual ou todos de uma vez

### 👤 Gerador de CPF
- Com ou sem máscara
- Dígitos verificadores calculados pelo algoritmo Módulo 11
- Gere até 50 CPFs de uma vez

### 📄 Formatador de XML
- Indentação automática com parse via `DOMParser`
- Modo **Escapado**: converte o XML para uso como string em propriedade JSON
- Colar da área de transferência

### 📝 Markdown Viewer
- Preview em tempo real
- Suporte a tabelas, código, blockquotes, listas e mais
- Copiar o HTML gerado

### 🔤 Formatador de Texto
Transformações aplicáveis ao texto com preview em tempo real:

| Grupo | Transformações |
|-------|---------------|
| Capitalização | UPPER CASE, lower case, Capitalize Words, Sentence case |
| Espaços e linhas | Remover espaços nas bordas, Remover espaços duplos, Remover quebras de linha, Remover linhas vazias, Ordenar linhas A→Z, Remover linhas duplicadas |
| Caracteres | Remover acentos, Remover caracteres especiais, Remover números, Remover pontuação |

## Stack

- **Angular 19** — standalone components, signals, lazy-loaded routes
- **Firebase Hosting** — deploy e CDN
- Sem dependências de UI framework (zero Angular Material)
- Todas as operações são realizadas localmente no navegador

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
ng serve

# Build de produção
ng build --configuration production

# Deploy no Firebase
firebase deploy --only hosting
```

## Projeto Firebase

ID do projeto: `madjer-utils`

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
