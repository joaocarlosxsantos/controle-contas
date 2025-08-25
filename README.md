
# Controle de Contas Domésticas

Aplicação web para divisão de contas de casa entre membros de uma família. Permite cadastrar famílias, membros, contas (bills), e dividir valores de forma moderna, acessível e responsiva. Desenvolvido com Next.js, Prisma, PostgreSQL e Tailwind CSS.

## Funcionalidades

- Cadastro de famílias
- Cadastro de membros (com nome e telefone) vinculados à família
- Cadastro de contas/despesas
- Visual moderno com modo claro/escuro
- Acessibilidade e contraste garantidos
- Exclusão protegida: não permite remover família com membros cadastrados

## Como rodar o projeto localmente

1. **Clone o repositório:**
	```bash
	git clone https://github.com/joaocarlosxsantos/controle-contas.git
	cd controle-contas
	```

2. **Configure o banco de dados:**
	- Crie um banco PostgreSQL (pode usar Neon, Supabase, Railway, etc).
	- Copie a string de conexão para o arquivo `.env` na variável `DATABASE_URL`.
	- Exemplo:
	  ```env
	  DATABASE_URL=postgresql://usuario:senha@host:porta/banco?sslmode=require
	  ```

3. **Instale as dependências:**
	```bash
	npm install
	```

4. **Rode as migrations do Prisma:**
	```bash
	npx prisma migrate dev
	```

5. **Gere o Prisma Client:**
	```bash
	npx prisma generate
	```

6. **Inicie o servidor de desenvolvimento:**
	```bash
	npm run dev
	```

7. **Acesse no navegador:**
	[http://localhost:3000](http://localhost:3000)

---

Projeto feito com Next.js, Prisma, PostgreSQL e Tailwind CSS.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
