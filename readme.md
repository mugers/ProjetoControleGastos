Controle de Gastos 

Projeto de controle de contas de casa que fiz para treinar React e C#.
O sistema cadastra pessoas, categorias e as contas, e salva tudo no Firebase para não perder os dados.

O que o sistema faz?
Pessoas: Cadastra quem mora na casa. Se apagar a pessoa, as contas dela somem também (Cascade Delete).
Transações: Lança as contas.
Regra: Menor de 18 anos só pode lançar Despesa (não trabalha ainda hehe).
Regra: Não deixa lançar despesa em categoria de receita.
Relatório: Mostra quanto cada um gastou e o total da casa.

Tecnologias que usei
Front: React + Vite (fiz tudo num arquivo só pra facilitar).
Back: C# .NET (API que valida as regras).
Banco: Firebase Firestore (Banco na nuvem do Google).


Como rodar no seu PC

1. Ligar o Backend (C#)
O backend é quem tem as regras de validação.
Entre na pasta Backend.
Garanta que o arquivo firebase_key.json tá lá.
Rode o comando:
dotnet run


2. Ligar o Frontend (Site)
Entre na pasta Frontend.
Instale as coisas (se não tiver instalado ainda):
npm install


Rode o site:

npm run dev
Abre o link que aparecer (tipo http://localhost:5173).

Feito com café ☕ e React.
