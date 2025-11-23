# Como publicar o FitProg na Vercel

O código já foi enviado para o seu repositório: https://github.com/JoaoVictorPV/Dieta

Siga estes passos simples para colocar seu aplicativo online.

## 1. Conectar na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New..."** -> **"Project"**.
3. Selecione o repositório **`JoaoVictorPV/Dieta`**.
4. Clique em **Import**.

## 2. Configurar Banco de Dados (Profissional)
O código está preparado para usar o **Vercel Postgres**.
1. No painel do projeto na Vercel (durante o setup ou depois em Settings), vá para a aba **Storage**.
2. Clique em **Connect Store** -> **Postgres** -> **Create New**.
3. Dê um nome (ex: `fitprog-db`) e escolha a região (ex: `Washington, D.C.` ou `São Paulo` se disponível).
4. Clique em **Create**.
5. A Vercel adicionará automaticamente as variáveis de ambiente (`POSTGRES_URL`, etc.) ao seu projeto.

**Importante:**
Para criar as tabelas no banco de dados, você precisará rodar o script SQL.
1. No painel da Vercel, vá para a aba **Storage** -> Selecione seu banco.
2. Vá para a aba **Query**.
3. Copie o conteúdo do arquivo `src/lib/db-schema.sql` deste projeto.
4. Cole no console da Vercel e clique em **Run Query**.
5. (Opcional) Faça o mesmo com `src/lib/seed-data.sql` para popular os alimentos iniciais.

## 3. Deploy
1. Clique em **Deploy**.
2. Aguarde a finalização.
3. Seu app estará disponível na URL fornecida (ex: `dieta.vercel.app`).

## 4. Instalar no iPhone (PWA)
1. Abra o link do seu app no **Safari** do iPhone.
2. Toque no botão **Compartilhar** (quadrado com seta para cima).
3. Role para baixo e toque em **"Adicionar à Tela de Início"**.
4. Confirme o nome e toque em **Adicionar**.

Pronto! O FitProg está rodando profissionalmente na nuvem!
