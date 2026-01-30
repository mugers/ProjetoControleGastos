using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ControleGastos.Controllers
{
 
    // MODELOS 
    

    [FirestoreData]
    public class Pessoa
    {
        [FirestoreProperty] public string Id { get; set; }
        [FirestoreProperty] public string Nome { get; set; }
        [FirestoreProperty] public int Idade { get; set; }
    }

    [FirestoreData]
    public class Transacao
    {
        [FirestoreProperty] public string Id { get; set; }
        [FirestoreProperty] public string Descricao { get; set; }
        [FirestoreProperty] public double Valor { get; set; }
        [FirestoreProperty] public string Tipo { get; set; } // "Receita" ou "Despesa"
        [FirestoreProperty] public string CategoriaId { get; set; }
        [FirestoreProperty] public string PessoaId { get; set; }
    }

    
    // API 
    

    [ApiController]
    [Route("api/[controller]")]
    public class TransacoesController : ControllerBase
    {
        private readonly FirestoreDb _db;

        public TransacoesController()
        {
            // Configura a chave de acesso que baixamos do site
            string caminhoChave = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "firebase_key.json");
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", caminhoChave);

            // Conecta no banco com o ID do projeto
            _db = FirestoreDb.Create("controlegastos-27c00"); 
        }

        // POST: api/transacoes
        // Chamado quando o front manda salvar uma transação
        [HttpPost]
        public async Task<IActionResult> CriarTransacao([FromBody] Transacao transacao)
        {
            // Debug 
            Console.WriteLine("Recebi uma transação nova: " + transacao.Descricao);

            try 
            {
                // Busca a Pessoa no banco para conferir os dados
                DocumentSnapshot docPessoa = await _db.Collection("pessoas").Document(transacao.PessoaId).GetSnapshotAsync();
                
                // Busca a Categoria também
                DocumentSnapshot docCat = await _db.Collection("categorias").Document(transacao.CategoriaId).GetSnapshotAsync();

                // Se não achar algum deles dá erro
                if (!docPessoa.Exists || !docCat.Exists) 
                {
                    Console.WriteLine("Erro: Pessoa ou Categoria não existe");
                    return NotFound("Pessoa ou Categoria não encontrada");
                }

                // Transforma os dados do banco nas nossas classes
                var pessoa = docPessoa.ConvertTo<Pessoa>();
                var categoria = docCat.ToDictionary(); 

                // REGRA 1 
                // Validação de Idade 
                // Menor de 18 anos não pode ter receita, só despesa
                if (pessoa.Idade < 18 && transacao.Tipo == "Receita")
                {
                    return BadRequest("Menores de 18 anos apenas podem ter despesas.");
                }

                // REGRA 2 
                // Validação da Categoria 
                // Verifica se a categoria serve para o tipo de transação que estamos lançando
                
                // Logica para pegar a finalidade sem dar erro se estiver vazia
                string finalidadeCat = "Ambas";
                if (categoria.ContainsKey("Finalidade"))
                {
                    finalidadeCat = categoria["Finalidade"].ToString();
                }
                
                if (finalidadeCat != "Ambas" && finalidadeCat != transacao.Tipo)
                {
                    return BadRequest($"A categoria não aceita lançamentos do tipo {transacao.Tipo}");
                }

                // REGRA 3 
                // Valor positivo 
                // Não tem como gastar dinheiro negativo hehe
                if (transacao.Valor < 0) 
                {
                    return BadRequest("Valor deve ser positivo.");
                }

                // Se deu tudo certo, prepara para salvar
                transacao.Id = Guid.NewGuid().ToString(); // Cria um ID novo
                
                // Salva na coleção de transações
                DocumentReference docRef = _db.Collection("transacoes").Document(transacao.Id);
                await docRef.SetAsync(transacao);

                Console.WriteLine("Tudo certo, transação salva!");
                return Ok(transacao);
            }
            catch (Exception ex)
            {
                // Se der algum erro inesperado
                Console.WriteLine("Deu ruim: " + ex.Message);
                return StatusCode(500, $"Deu erro no servidor: {ex.Message}");
            }
        }
    }
}