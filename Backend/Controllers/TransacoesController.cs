using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ControleGastos.Controllers
{
    // --- MODELOS (Estrutura dos dados) ---
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
        [FirestoreProperty] public string Tipo { get; set; }
        [FirestoreProperty] public string CategoriaId { get; set; }
        [FirestoreProperty] public string PessoaId { get; set; }
    }

    // --- CONTROLLER (A API) ---
    [ApiController]
    [Route("api/[controller]")]
    public class TransacoesController : ControllerBase
    {
        private readonly FirestoreDb _db;

        public TransacoesController()
        {
            // 1. CONFIGURAÇÃO DA CHAVE
            string caminhoChave = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "firebase_key.json");
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", caminhoChave);

            // 2. CONEXÃO COM O BANCO
            // ATENÇÃO: TROQUE PELO SEU ID
            _db = FirestoreDb.Create("controlegastos-27c00"); 
        }

        [HttpPost]
        public async Task<IActionResult> CriarTransacao([FromBody] Transacao transacao)
        {
            try 
            {
                DocumentSnapshot docPessoa = await _db.Collection("pessoas").Document(transacao.PessoaId).GetSnapshotAsync();
                DocumentSnapshot docCat = await _db.Collection("categorias").Document(transacao.CategoriaId).GetSnapshotAsync();

                if (!docPessoa.Exists || !docCat.Exists) return NotFound("Pessoa ou Categoria não encontrada");

                var pessoa = docPessoa.ConvertTo<Pessoa>();
                var categoria = docCat.ToDictionary(); 

                if (pessoa.Idade < 18 && transacao.Tipo == "Receita")
                    return BadRequest("Menores de 18 anos apenas podem ter despesas.");

                string finalidadeCat = categoria.ContainsKey("Finalidade") ? categoria["Finalidade"].ToString() : "Ambas";
                if (finalidadeCat != "Ambas" && finalidadeCat != transacao.Tipo)
                    return BadRequest($"A categoria não aceita lançamentos do tipo {transacao.Tipo}");

                if (transacao.Valor < 0) return BadRequest("Valor deve ser positivo.");

                transacao.Id = Guid.NewGuid().ToString();
                DocumentReference docRef = _db.Collection("transacoes").Document(transacao.Id);
                await docRef.SetAsync(transacao);

                return Ok(transacao);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }
    }
}
