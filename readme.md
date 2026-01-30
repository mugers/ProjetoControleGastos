Funcionalidades Principais

1. Gestão de Entidades (Pessoas)

-CRUD Completo: Cadastro, leitura, atualização e remoção de moradores.
-Integridade Referencial: Implementação de Cascade Delete (Exclusão em Cascata). Ao remover um registro de pessoa, o sistema garante a limpeza do banco de dados removendo automaticamente todas as transações financeiras associadas, prevenindo a existência de registros órfãos.

2. Controle de Transações Financeiras

-O módulo principal do sistema conta com validações estritas de regras de negócio no Backend e Frontend:
-Validação de Maioridade: Restrição lógica que impede o cadastro de receitas para indivíduos menores de 18 anos.
-Consistência de Categorias: Validação cruzada que impede a associação de categorias incompatíveis com o tipo de transação (ex: Categoria de 'Despesa' em um lançamento de 'Receita').
-Sanitização de Dados: Garantia de que apenas valores positivos sejam processados.

3. Dashboard e Relatórios

-Visualização consolidada do fluxo de caixa (Receitas, Despesas e Saldo Líquido).
-Detalhamento analítico segregado por Pessoa e por Categoria de gasto.

--Stack Tecnológico
Frontend: React (TypeScript + Vite) - Foco em componentes funcionais e hooks.
Backend: C# .NET 8.0 WebAPI - Implementação de Controllers e regras de negócio.
Banco de Dados: Google Firestore (NoSQL) - Persistência de dados em tempo real e escalável.
Estilização: CSS Customizado com Design System "Dark Mode".


Execução

Requisitos:Node.js (LTS), .NET SDK 8.0, Ambiente Firebase configurado (Firestore e Authentication)

1. Navegue até o diretório Backend.
2. Assegure-se de que o arquivo de credenciais firebase_key.json esteja presente na raiz do diretório.
3. Execute o servidor:
4. dotnet run
5. Navegue até o diretório Frontend.
6. Instale as dependências do projeto (caso seja a primeira execução):
7. npm install
8. Inicie o servidor de desenvolvimento:
9. npm run dev
10. Acesse a aplicação através do endereço local indicado (padrão: http://localhost:5173).