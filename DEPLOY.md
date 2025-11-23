# Como publicar o FitProg na Vercel

Siga estes passos simples para colocar seu aplicativo online e instalar no seu iPhone.

## 1. Preparar o Código (Já feito!)
O código já está pronto. Você precisa ter o código em um repositório Git (GitHub, GitLab ou Bitbucket).
Se ainda não fez o commit do código:
1. Crie um repositório no GitHub.
2. Envie este código para lá.

## 2. Criar Projeto na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar sua conta do GitHub).
2. Clique em **"Add New..."** -> **"Project"**.
3. Selecione o repositório do `fitprog` que você acabou de criar.
4. Clique em **Import**.

## 3. Configurar Variáveis de Ambiente
Na tela de configuração do projeto (antes de clicar em Deploy), procure a seção **Environment Variables**.
Adicione a seguinte variável (se você for usar a IA no futuro):
- **Name:** `GOOGLE_GENERATIVE_AI_API_KEY`
- **Value:** `Sua_Chave_Aqui` (A chave que estava no arquivo .env.local)

Se não for usar a IA agora, pode pular, pois o app está configurado para criação manual de treinos.

## 4. Banco de Dados (Vercel Postgres)
Para que a persistência funcione na nuvem (além do seu celular), você deve criar um banco de dados:
1. No painel do projeto na Vercel, vá para a aba **Storage**.
2. Clique em **Connect Store** -> **Postgres** -> **Create New**.
3. Aceite as configurações padrão.
4. Após criado, vá para a aba de configurações do banco e copie as credenciais para as variáveis de ambiente do projeto (a Vercel geralmente faz isso automaticamente se você clicar em "Pull .env" localmente, mas na nuvem é automático).

*Nota: Na versão atual, o app está salvando tudo no **Histórico do Navegador (LocalStorage)** para facilitar o uso imediato sem configurar banco de dados complexo. Se você limpar o cache do celular, perde os dados. Para uso profissional, ative o Postgres e descomente o código de conexão no futuro.*

## 5. Deploy
Clique em **Deploy**. Aguarde alguns instantes.
Você receberá um link (ex: `fitprog.vercel.app`).

## 6. Instalar no iPhone (PWA)
1. Abra o link do seu app no **Safari** do iPhone.
2. Toque no botão **Compartilhar** (quadrado com seta para cima).
3. Role para baixo e toque em **"Adicionar à Tela de Início"**.
4. Confirme o nome e toque em **Adicionar**.

Pronto! O FitProg aparecerá como um aplicativo nativo no seu celular.
