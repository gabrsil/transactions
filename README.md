
## App de Transações
App básico com funções de criação de conta, autenticação e funcionalidade de realizar transferências para outras contas. Cada conta possui um código único no qual pode receber transferências.

### Ferramentas utilizadas
- Node
- Koa
- Graphql
- graphql-helix
- mongodb
- bull

### Requisitos

- Node versão 21.x

### Executando
#### Instale as dependencias
```sh
    npm i
 ```

#### Execute o App
```sh
    npm run start
 ```

### Testes

Para executar os testes rode o comando:
```sh
npm run test
```

### Regra de negócio

#### Entidades
- User - Armazena todas informações relacionadas ao usuário.
- Sessions - Lida com tudo relacionado a autenticação e autorização do usuário.
- Transactions - Armazena informações sobre transações, transferências.

