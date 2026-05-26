# Clone TabNews

Projeto desenvolvido durante os estudos no **curso.dev**, com o objetivo de reconstruir funcionalidades essenciais de uma aplicação inspirada no TabNews.

A proposta é entender como aplicações reais funcionam por baixo dos panos, praticando conceitos como APIs REST, autenticação, sessões, cookies, banco de dados, migrations, testes automatizados, tratamento de erros e boas práticas de engenharia de software.

## Tecnologias utilizadas

- JavaScript
- Node.js
- Next.js
- Next.js API Routes
- React
- next-connect
- PostgreSQL
- Docker
- node-pg-migrate
- Jest
- bcryptjs
- cookie
- set-cookie-parser
- Nodemailer
- Mailcatcher
- Secretlint
- ESLint
- Prettier
- Husky
- Commitizen

## Funcionalidades principais

- Criação, consulta e atualização de usuários
- Login com email e senha
- Criação, renovação e encerramento de sessões
- Autenticação via cookie `session_id`
- Consulta do usuário autenticado
- Validação de sessão ativa
- Tratamento centralizado de erros
- Controle de métodos HTTP permitidos
- Testes automatizados de integração
- Migrations com PostgreSQL
- Verificação de segredos antes do commit

## Estrutura do projeto

```txt
infra/
  compose.yaml
  controller.js
  database.js
  errors.js
  migrations/
  scripts/

models/
  authentication.js
  password.js
  session.js
  user.js

pages/
  api/
    v1/
      sessions/
      status/
      user/
      users/

tests/
  integration/
    api/
      v1/
```

## Endpoints principais

### Status

```txt
GET /api/v1/status
```

Retorna informações sobre a aplicação e a conexão com o banco de dados.

### Usuários

```txt
POST  /api/v1/users
GET   /api/v1/users/[username]
PATCH /api/v1/users/[username]
```

Responsáveis pela criação, consulta e atualização de usuários.

### Sessões

```txt
POST   /api/v1/sessions
DELETE /api/v1/sessions
```

Responsáveis pela criação e encerramento de sessões.

### Usuário autenticado

```txt
GET /api/v1/user
```

Retorna as informações do usuário autenticado com base no cookie `session_id`.

Esse endpoint também valida a sessão ativa, renova sua expiração e reenvia o cookie atualizado na resposta.

## Autenticação e sessões

O fluxo principal de autenticação funciona da seguinte forma:

1. O usuário é criado por meio do endpoint `POST /api/v1/users`.
2. O usuário realiza login com email e senha em `POST /api/v1/sessions`.
3. A senha enviada é comparada com a senha criptografada armazenada no banco.
4. Se os dados estiverem corretos, uma nova sessão é criada.
5. A API retorna um cookie `session_id` com o token da sessão.
6. Esse cookie é utilizado para acessar endpoints autenticados.
7. Ao acessar `GET /api/v1/user`, a sessão é validada e renovada.
8. O usuário pode encerrar a sessão usando `DELETE /api/v1/sessions`.

As sessões possuem validade de 30 dias e utilizam tokens gerados de forma aleatória com o módulo `crypto` do Node.js.

O cookie de sessão é configurado com:

- `HttpOnly`
- `Path=/`
- `Max-Age`
- `Secure` em ambiente de produção

## Banco de dados

O projeto utiliza **PostgreSQL** como banco de dados principal.

A conexão é feita diretamente com a biblioteca `pg`, usando variáveis de ambiente para configurar host, porta, usuário, senha e nome do banco.

As alterações estruturais do banco são controladas por migrations com `node-pg-migrate`.

## Docker

O ambiente de desenvolvimento utiliza Docker Compose para subir os serviços necessários.

Serviços disponíveis:

```txt
postgres-dev
mailcatcher-dev
```

Portas utilizadas:

```txt
PostgreSQL: 5432
Mailcatcher SMTP: 1025
Mailcatcher Web: 1080
```

## Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/PauloGuilhermee/clone-tabnews.git
```

### 2. Acesse a pasta do projeto

```bash
cd clone-tabnews
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.development` na raiz do projeto.

Exemplo:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=local_user
POSTGRES_DB=clone_tabnews
POSTGRES_PASSWORD=local_password
```

> Os valores acima são apenas exemplos. Use as credenciais corretas do seu ambiente local.

### 5. Rode o ambiente de desenvolvimento

```bash
npm run dev
```

Esse comando sobe os serviços Docker, aguarda o PostgreSQL aceitar conexões, executa as migrations e inicia o servidor Next.js.

A aplicação ficará disponível em:

```txt
http://localhost:3000
```

## Scripts disponíveis

```bash
npm run dev
```

Inicia o ambiente de desenvolvimento completo.

```bash
npm run services:up
```

Sobe os serviços Docker.

```bash
npm run services:stop
```

Para os serviços Docker.

```bash
npm run services:down
```

Remove os serviços Docker.

```bash
npm run migrations:create nome_da_migration
```

Cria uma nova migration.

```bash
npm run migrations:up
```

Executa as migrations pendentes.

```bash
npm test
```

Executa os testes automatizados.

```bash
npm run test:watch
```

Executa os testes em modo watch.

```bash
npm run lint:prettier:check
```

Verifica a formatação com Prettier.

```bash
npm run lint:prettier:fix
```

Corrige a formatação com Prettier.

```bash
npm run lint:eslint:check
```

Executa a análise do ESLint.

```bash
npm run lint:secrets
```

Verifica possíveis segredos nos arquivos staged.

```bash
npm run commit
```

Cria commits utilizando Commitizen.

## Testes

O projeto utiliza **Jest** para testes automatizados de integração.

Os testes validam cenários como:

- criação de usuários;
- consulta e atualização de usuários;
- login;
- criação de sessão;
- renovação de sessão;
- encerramento de sessão;
- acesso ao usuário autenticado;
- sessão inexistente;
- sessão expirada;
- métodos HTTP não permitidos;
- respostas de erro padronizadas.

Para rodar todos os testes:

```bash
npm test
```

Para rodar um teste específico:

```bash
npm run test:watch -- /user/get.test.js
```

## Tratamento de erros

A API utiliza tratamento centralizado de erros no controller da aplicação.

Exemplo de resposta:

```json
{
  "name": "UnauthorizedError",
  "message": "Usuário não possui sessão ativa.",
  "action": "Verifique se este usuário está logado e tente novamente.",
  "status_code": 401
}
```

Principais erros utilizados:

- `ValidationError`
- `NotFoundError`
- `UnauthorizedError`
- `MethodNotAllowedError`
- `InternalServerError`
- `ServicesError`

## Qualidade e segurança

O projeto aplica práticas como:

- senhas armazenadas com hash;
- comparação segura de senha com bcrypt;
- cookies `HttpOnly`;
- sessões com token aleatório;
- expiração e renovação de sessão;
- queries SQL parametrizadas;
- tratamento centralizado de erros;
- verificação de segredos com Secretlint;
- padronização de código com ESLint e Prettier;
- padronização de commits com Commitizen.

## Aprendizados

Durante o desenvolvimento deste projeto, foram praticados conceitos importantes de backend e engenharia de software, como:

- construção de APIs REST com Next.js;
- autenticação com email e senha;
- gerenciamento de sessões;
- manipulação de cookies no backend;
- integração com PostgreSQL;
- migrations;
- testes de integração;
- debugging de erros reais;
- organização de código por responsabilidades;
- automação de ambiente com Docker;
- boas práticas de Git;
- segurança básica em aplicações web.

## Status

Projeto em desenvolvimento para fins de estudo e prática durante o curso.dev.

## Autor

Desenvolvido por Paulo Guilherme.
