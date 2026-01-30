//IMPORTS
import React, { useState, useEffect } from 'react';
import { Trash2, Edit, X, Calculator, Users, List, Tag } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, query } from 'firebase/firestore';


// CONFIGURAÇÃO


// CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBDVH9Ek3TglhX8S3WinfE2QbGGdndcjU8",
  authDomain: "controlegastos-27c00.firebaseapp.com",
  projectId: "controlegastos-27c00",
  storageBucket: "controlegastos-27c00.firebasestorage.app",
  messagingSenderId: "27775420137",
  appId: "1:27775420137:web:0450ef8ca000542ad1d278",
  measurementId: "G-JCDQFZ3238"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ID FIREBASE
const appId = firebaseConfig.projectId || 'controlegastos-27c00';


// FRONTEND

const STYLES = `
  :root { --bg: #121212; --card: #1e1e1e; --input: #000; --border: #333; --text: #e0e0e0; --muted: #a0a0a0; --white: #fff; }
  * { box-sizing: border-box; }
  
  html, body, #root { 
    margin: 0; padding: 0; background-color: var(--bg); color: var(--text); 
    font-family: 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; 
    min-height: 100vh; width: 100%;
  }

  .app { min-height: 100vh; width: 100%; display: flex; flex-direction: column; background-color: var(--bg); }
  
  /* Navbar */
  .nav { background: #000; border-bottom: 1px solid var(--border); padding: 1rem 2rem; }
  .nav-in { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
  .brand { font-size: 1.25rem; font-weight: 800; display: flex; gap: 0.75rem; text-transform: uppercase; color: var(--white); align-items: center; }
  .main { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; width: 100%; flex: 1; }
  
  /* UI Elements */
  .card { background: var(--card); border: 1px solid var(--border); padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 6px #00000050; }
  .title { font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: 0.1em; color: var(--white); }
  
  .form { display: flex; gap: 1.5rem; margin-bottom: 2rem; background: #0a0a0a; padding: 1.5rem; border: 1px solid var(--border); flex-wrap: wrap; align-items: flex-end; }
  .field { flex: 1; min-width: 200px; }
  .field.sm { flex: 0 0 150px; }
  .label { display: block; font-size: 0.75rem; font-weight: bold; color: var(--muted); margin-bottom: 0.5rem; text-transform: uppercase; }
  .input { width: 100%; padding: 0.8rem; background: var(--input); border: 1px solid var(--border); color: var(--white); font-size: 1rem; }
  .input:focus { outline: none; border-color: var(--white); background: #111; }
  
  .btn { cursor: pointer; border: 1px solid transparent; padding: 0.75rem 1.5rem; font-weight: bold; text-transform: uppercase; font-size: 0.85rem; transition: 0.2s; background: transparent; color: var(--white); }
  .btn-nav { display: flex; align-items: center; gap: 0.5rem; color: var(--muted); padding: 0.6rem 1.2rem; }
  .btn-nav:hover { color: var(--white); background: #222; border-color: var(--border); }
  .btn-nav.active { background: #ffffff; color: #000000; border-color: #000000; }
  .btn-primary { background: #000; color: #fff; border-color: #fff; }
  .btn-primary:hover { background: #fff; color: #000; }
  .btn-sec { border-color: var(--border); }
  .btn-sec:hover { border-color: var(--white); background: #222; }
  .btn-icon { padding: 6px; color: var(--muted); border: none; background: none; }
  .btn-icon:hover { color: var(--white); background: #333; border-radius: 4px; }
  
  .table-box { overflow-x: auto; border: 1px solid var(--border); background: #000; }
  .table { width: 100%; border-collapse: collapse; text-align: left; }
  .table th { background: #0a0a0a; color: var(--muted); padding: 1rem; border-bottom: 1px solid var(--border); font-size: 0.75rem; text-transform: uppercase; }
  .table td { padding: 1rem; border-bottom: 1px solid var(--border); color: var(--text); font-size: 0.95rem; }
  .table tr:hover { background: #1a1a1a; }
  .mono { font-family: monospace; }
  
  .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
  .stat { padding: 2rem; border: 1px solid var(--border); text-align: center; background: #000; }
  .stat.highlight { border-color: var(--white); }
  .stat-val { font-size: 2rem; font-family: monospace; font-weight: 700; color: #fff; display: block; margin-top: 0.5rem; }
  .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
  .cat-item { background: #0a0a0a; border: 1px solid var(--border); padding: 1.25rem; display: flex; justify-content: space-between; }
  .badge { font-size: 0.7rem; text-transform: uppercase; padding: 0.25rem 0.5rem; border: 1px solid var(--border); color: var(--white); }
  .error { background: #200; border: 1px solid #f44; color: #fcc; padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; }
  .loading { text-align: center; color: var(--muted); padding: 2rem; font-style: italic; }
`;

// CAMADA DE DADOS 
const Api = {
  
  // Garante que pegamos o ID do usuário atual para segurança.
  _getUid: () => auth.currentUser?.uid,
  
  // CAMINHO DO BANCO:  
  // Isso garante que cada usuário veja apenas os seus próprios dados.
  _col: (name: string) => {
    const uid = Api._getUid();
    if (!uid) throw new Error("Usuário não autenticado");
    return collection(db, 'artifacts', appId, 'users', uid, name);
  },
  
  // GERADOR DE ID: Cria uma string aleatória para usar como chave primária.
  _id: () => Math.random().toString(36).substr(2, 9),

  // PESSOAS 
  
  // Busca todos os documentos da coleção 'pessoas' no Firestore.
  listarPessoas: async () => {
    if (!auth.currentUser) return [];
    const snap = await getDocs(Api._col('pessoas'));
    // Mapeia o resultado complexo do Firebase para um JSON simples.
    return snap.docs.map(d => d.data());
  },
  
  // ESCRITA: Salva ou atualiza uma pessoa.
  salvarPessoa: async (p: any) => {
    // Se já tem ID usa ele (edição), senão cria um novo (criação).
    const id = p.id || Api._id();
    const novaPessoa = { ...p, id };
    // grava o dado no caminho específico do documento.
    await setDoc(doc(Api._col('pessoas'), id), novaPessoa);
  },
  
  // Remove a pessoa e suas dependências.
  deletarPessoa: async (id: string) => {
    // Remove a pessoa do banco.
    await deleteDoc(doc(Api._col('pessoas'), id));
    
    // Busca todas as transações para limpar as que ficaram órfãs.
    const transSnap = await getDocs(query(Api._col('transacoes')));
    // Filtra localmente as transações que pertenciam a essa pessoa.
    const transacoes = transSnap.docs.map(d => d.data()).filter((t: any) => t.pessoaId === id);
    
    // Apaga cada transação vinculada encontrada.
    for (const t of transacoes) {
      await deleteDoc(doc(Api._col('transacoes'), t.id));
    }
  },

  // CATEGORIAS
  
  // LEITURA: Busca categorias disponíveis.
  listarCategorias: async () => {
    if (!auth.currentUser) return [];
    const snap = await getDocs(Api._col('categorias'));
    return snap.docs.map(d => d.data());
  },
  
  // ESCRITA: Salva nova categoria.
  salvarCategoria: async (c: any) => {
    const id = c.id || Api._id();
    await setDoc(doc(Api._col('categorias'), id), { ...c, id });
  },

  // TRANSAÇÕES 
  listarTransacoes: async () => {
    if (!auth.currentUser) return [];
    const snap = await getDocs(Api._col('transacoes'));
    return snap.docs.map(d => d.data());
  },
  
  salvarTransacao: async (t: any) => {
    // Pré-carrega dados auxiliares para validação de Regras de Negócio.
    const pessoas = await Api.listarPessoas();
    const cats = await Api.listarCategorias();
    
    // Localiza os objetos completos baseados nos IDs selecionados.
    const p: any = pessoas.find((x: any) => x.id === t.pessoaId);
    const c: any = cats.find((x: any) => x.id === t.categoriaId);

    // Validação de Integridade: IDs devem existir.
    if (!p || !c) return { erro: 'Dados inválidos.' };
    
    // Regra 1: 
    // Menores de 18 anos não podem ter Receitas (Apenas Despesas).
    if (Number(p.idade) < 18 && t.tipo === 'Receita') 
      return { erro: 'Menores de 18 anos só podem lançar Despesas.' };

    // Regra 2: 
    // Validação Cruzada (Categoria x Tipo).
    // Impede lançar "Despesa" numa categoria "Receita" e vice-versa.
    if (c.finalidade !== 'Ambas' && c.finalidade !== t.tipo) 
      return { erro: `Categoria '${c.descricao}' não aceita ${t.tipo}.` };

    // Se passou nas regras, define ID e converte valor para Number antes de salvar.
    const id = t.id || Api._id();
    await setDoc(doc(Api._col('transacoes'), id), { ...t, id, valor: Number(t.valor) });
    return { ok: true };
  }
};

// COMPONENTES UI

const Input = ({ label, sm, ...props }: any) => (
  <div className={`field ${sm ? 'sm' : ''}`}>
    <label className="label">{label}</label>
    {props.type === 'select' ? 
      <select className="input" {...props}>{props.children}</select> : 
      <input className="input" {...props} />
    }
  </div>
);

// APP  
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('relatorio');

  useEffect(() => {
    // Inicia login anônimo ao carregar a página.
    // Sem isso o Firestore ta bloqueando o acesso por segurança.
    signInAnonymously(auth).catch(err => console.error("Erro auth:", err));
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Bloqueia a renderização até que o Firebase confirme a autenticação pra evitar crash.
  if (!user) return <div style={{background:'#121212', height:'100vh', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>Conectando ao Firebase...</div>;

  return (
    <div className="app">
      <style>{STYLES}</style>
      <nav className="nav">
        <div className="nav-in">
          <div className="brand"><Calculator size={45} color='green' /> Controle de gastos</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'pessoas', label: 'Pessoas', icon: <Users size={18}/> },
              { id: 'categorias', label: 'Categorias', icon: <Tag size={18}/> },
              { id: 'transacoes', label: 'Transações', icon: <List size={18}/> },
              { id: 'relatorio', label: 'Relatório', icon: <Calculator size={18}/> }
            ].map(menu => (
              <button key={menu.id} onClick={() => setView(menu.id)} className={`btn btn-nav ${view === menu.id ? 'active' : ''}`}>
                {menu.icon} {menu.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="main">
        {view === 'pessoas' && <TelaPessoas />}
        {view === 'categorias' && <TelaCategorias />}
        {view === 'transacoes' && <TelaTransacoes />}
        {view === 'relatorio' && <TelaRelatorio />}
      </main>
    </div>
  );
}

// 6. TELAS

function TelaPessoas() {
  // Controlar a lista exibida e o formulário
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ id: '', nome: '', idade: '' });
  const [loading, setLoading] = useState(false);

  // Buscar dados atualizados da API Usa 'loading' para feedback visual.
  const refresh = async () => {
    setLoading(true);
    const data = await Api.listarPessoas();
    setList(data);
    setLoading(false);
  };

  // Carrega a lista assim que o componente é montado
  useEffect(() => { refresh(); }, []);
  
  // Manipulador de envio do formulário 
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // A pessoa tem que ter nascido hehe.
    if (Number(form.idade) <= 0) {
      alert("A pessoa tem que ter nascido hehe");
      return; // Para a função aqui e não salva
    }

    // DUPLICIDADE!!!!
    // Verifica se já existe alguém com mesmo Nome e Idade
    const duplicado = list.some((p: any) => 
      p.nome.trim().toLowerCase() === form.nome.trim().toLowerCase() && 
      Number(p.idade) === Number(form.idade) &&
      p.id !== form.id
    );

    if (duplicado) {
      alert("Já existe uma pessoa cadastrada com esse nome e idade.");
      return; // Bloqueia o salvamento
    }

    await Api.salvarPessoa(form); 
    setForm({ id: '', nome: '', idade: '' }); // Limpa o formulário
    refresh(); // Atualiza a lista na tela
  };

  // Preenche o formulário com os dados da pessoa selecionada para edição
  const handleEdit = (p: any) => setForm(p);

  // Exclusão com confirmação e atualização da lista
  const handleDelete = async (id: string) => {
    if (confirm('Excluir pessoa e suas transações?')) {
      await Api.deletarPessoa(id);
      refresh();
    }
  };

  return (
    <div className="card">
      <h2 className="title">Pessoas</h2>
      <form onSubmit={handleSubmit} className="form">
        <Input label="Nome" value={form.nome} onChange={(e:any) => setForm({...form, nome: e.target.value})} maxLength={200} required />
        <Input label="Idade" sm type="number" value={form.idade} onChange={(e:any) => setForm({...form, idade: e.target.value})} required />
        <div style={{ alignSelf: 'center' }}>
          <button type="submit" className="btn btn-primary">{form.id ? 'Atualizar' : 'Cadastrar'}</button>
          {form.id && <button type="button" onClick={() => setForm({ id: '', nome: '', idade: '' })} className="btn btn-sec" style={{ marginLeft: 10 }}>Cancelar</button>}
        </div>
      </form>
      
      {loading ? <div className="loading">Carregando...</div> :
      <div className="table-box">
        <table className="table">
          <thead><tr><th>Nome</th><th>Idade</th><th style={{textAlign:'right'}}>Ações</th></tr></thead>
          <tbody>
            {list.map((p:any) => (
              <tr key={p.id}>
                <td>{p.nome}</td><td style={{color:'#888'}}>{p.idade} anos</td>
                <td style={{textAlign:'right'}}>
                  <button onClick={() => handleEdit(p)} className="btn btn-icon"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(p.id)} className="btn btn-icon"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={3} style={{textAlign:'center', color:'#888', padding:'2rem'}}>Nenhuma pessoa cadastrada.</td></tr>}
          </tbody>
        </table>
      </div>}
    </div>
  );
}

function TelaCategorias() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ descricao: '', finalidade: 'Despesa' });

  // Similar TelaPessoas busca categorias do banco
  const refresh = async () => setList(await Api.listarCategorias());
  useEffect(() => { refresh(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await Api.salvarCategoria(form);
    refresh();
    setForm({ ...form, descricao: '' });
  };

  return (
    <div className="card">
      <h2 className="title">Categorias</h2>
      <form onSubmit={handleSubmit} className="form">
        <Input label="Descrição" value={form.descricao} onChange={(e:any) => setForm({...form, descricao: e.target.value})} maxLength={400} required />
        <Input label="Finalidade" sm type="select" value={form.finalidade} onChange={(e:any) => setForm({...form, finalidade: e.target.value})}>
          {['Despesa', 'Receita', 'Ambas'].map(o => <option key={o} value={o}>{o}</option>)}
        </Input>
        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'center' }}>Adicionar</button>
      </form>

      <div className="cat-grid">
        {list.map((c:any) => (
          <div key={c.id} className="cat-item">
            <strong>{c.descricao}</strong>
            <span className="badge">{c.finalidade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TelaTransacoes() {
  // Armazenar dependências para os selects
  const [data, setData] = useState({ pessoas: [], cats: [] });
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ descricao: '', valor: '', tipo: 'Despesa', pessoaId: '', categoriaId: '' });
  const [erro, setErro] = useState(''); 

  const refresh = async () => {
    const p = await Api.listarPessoas();
    const c = await Api.listarCategorias();
    const t = await Api.listarTransacoes();
    
    setData({ pessoas: p as any, cats: c as any });
    setList(t as any);
  };

  useEffect(() => { refresh(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErro('');
    // Tenta salvar através da API
    const res = await Api.salvarTransacao(form);
    if (res.erro) {
      setErro(res.erro); 
    } else {
      refresh();
      setForm({ ...form, descricao: '', valor: '' }); 
    }
  };

  // Helper local para traduzir IDs armazenados na transação  para Nomes para exibir na tabela
  const getName = (id: string, src: any[]) => src.find(x => x.id === id)?.nome || src.find(x => x.id === id)?.descricao || '-';

  return (
    <div className="card">
      <h2 className="title">Transações</h2>
      {erro && <div className="error"><span>{erro}</span><button onClick={() => setErro('')} className="btn-icon"><X size={16}/></button></div>}
      
      {/* Bloqueia o formulário se não houver dados básicos cadastrados */}
      {(data.pessoas.length === 0 || data.cats.length === 0) ? 
        <div style={{textAlign:'center', padding: '2rem', color:'#888'}}>Cadastre Pessoas e Categorias primeiro.</div> :
        <form onSubmit={handleSubmit} className="form">
          <Input label="Descrição" value={form.descricao} onChange={(e:any) => setForm({...form, descricao: e.target.value})} maxLength={400} required />
          <Input label="Valor" type="number" step="0.01" min="0" value={form.valor} onChange={(e:any) => setForm({...form, valor: e.target.value})} required />
          <Input label="Tipo" type="select" value={form.tipo} onChange={(e:any) => setForm({...form, tipo: e.target.value})}>
            <option value="Despesa">Despesa</option><option value="Receita">Receita</option>
          </Input>
          <Input label="Pessoa" type="select" value={form.pessoaId} onChange={(e:any) => setForm({...form, pessoaId: e.target.value})} required>
            <option value="">Selecione...</option>
            {data.pessoas.map((p:any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </Input>
          <Input label="Categoria" type="select" value={form.categoriaId} onChange={(e:any) => setForm({...form, categoriaId: e.target.value})} required>
            <option value="">Selecione...</option>
            {data.cats.map((c:any) => <option key={c.id} value={c.id}>{c.descricao}</option>)}
          </Input>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'center' }}>Registrar</button>
        </form>
      }

      <div className="table-box">
        <table className="table">
          <thead><tr><th>Desc</th><th>Pessoa</th><th>Cat</th><th style={{textAlign:'right'}}>Valor</th></tr></thead>
          <tbody>
            {[...list].reverse().map((t:any) => (
              <tr key={t.id}>
                <td><strong>{t.descricao}</strong></td>
                <td style={{color:'#aaa'}}>{getName(t.pessoaId, data.pessoas)}</td>
                <td style={{color:'#aaa'}}>{getName(t.categoriaId, data.cats)}</td>
                <td style={{textAlign:'right', fontFamily:'monospace', color: t.tipo === 'Receita' ? '#fff' : '#aaa'}}>
                  {t.tipo === 'Despesa' ? '-' : '+'} {Number(t.valor).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TelaRelatorio() {
  const [rel, setRel] = useState({ pessoas: [], cats: [], geral: { rec: 0, desp: 0, saldo: 0 } });

  useEffect(() => {
    // Carregamento de dados para o relatório. 
    // Busca dados em sequencia para garantir que tudo carregou
    const load = async () => {
      const pessoas = await Api.listarPessoas();
      const transacoes = await Api.listarTransacoes();
      const categorias = await Api.listarCategorias();
      
      // Função de cálculo que percorre itens e soma suas transações
      const calc = (items: any[], idKey: string) => items.map(item => {
        const rec = transacoes.filter((t:any) => t[idKey] === item.id && t.tipo === 'Receita').reduce((a:any, b:any) => a + b.valor, 0);
        const desp = transacoes.filter((t:any) => t[idKey] === item.id && t.tipo === 'Despesa').reduce((a:any, b:any) => a + b.valor, 0);
        return { ...item, rec, desp, saldo: rec - desp };
      });

      const relPessoas: any = calc(pessoas, 'pessoaId');
      const relCats: any = calc(categorias, 'categoriaId');
      
      // Calcula o Total Geral 
      const geral = relPessoas.reduce((acc: any, curr: any) => ({ 
        rec: acc.rec + curr.rec, desp: acc.desp + curr.desp, saldo: acc.saldo + curr.saldo 
      }), { rec: 0, desp: 0, saldo: 0 });

      setRel({ pessoas: relPessoas, cats: relCats, geral });
    };
    load();
  }, []);

  const Row = ({ label, r, d, s, style = {} }: any) => (
    <tr style={style}>
      <td>{label}</td>
      <td style={{textAlign:'right', color: '#888'}} className="mono">{r.toFixed(2)}</td>
      <td style={{textAlign:'right', color: '#888'}} className="mono">{d.toFixed(2)}</td>
      <td style={{textAlign:'right', fontWeight:'bold'}} className="mono">{s.toFixed(2)}</td>
    </tr>
  );

  return (
    <div>
      <div className="dash-grid">
        <div className="stat"><span className="label">Receitas</span><span className="stat-val">{rel.geral.rec.toFixed(2)}</span></div>
        <div className="stat"><span className="label">Despesas</span><span style={{color:'#aaa'}} className="stat-val">{rel.geral.desp.toFixed(2)}</span></div>
        <div className="stat highlight"><span className="label" style={{color:'#fff'}}>Saldo</span><span className="stat-val">{rel.geral.saldo.toFixed(2)}</span></div>
      </div>

      <div className="card">
        <h2 className="title">Totais por Pessoa</h2>
        <div className="table-box">
          <table className="table">
            <thead><tr><th>Nome</th><th style={{textAlign:'right'}}>Receitas</th><th style={{textAlign:'right'}}>Despesas</th><th style={{textAlign:'right'}}>Saldo</th></tr></thead>
            <tbody>
              {rel.pessoas.map((p:any) => <Row key={p.id} label={p.nome} r={p.rec} d={p.desp} s={p.saldo} />)}
              <Row label="TOTAL GERAL" r={rel.geral.rec} d={rel.geral.desp} s={rel.geral.saldo} style={{background: '#1a1a1a', borderTop: '2px solid #fff', color: '#fff'}} />
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="title">Totais por Categoria</h2>
        <div className="table-box">
          <table className="table">
            <thead><tr><th>Categoria</th><th style={{textAlign:'right'}}>Receitas</th><th style={{textAlign:'right'}}>Despesas</th><th style={{textAlign:'right'}}>Saldo</th></tr></thead>
            <tbody>
              {rel.cats.map((c:any) => <Row key={c.id} label={c.descricao} r={c.rec} d={c.desp} s={c.saldo} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}