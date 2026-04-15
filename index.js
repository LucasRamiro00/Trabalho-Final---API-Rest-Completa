const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const jwt = require('jsonwebtoken'); 

const app = express();
app.use(express.json());

const SECRET_KEY = "chave_super_secreta_steam"; 

let db;

async function setupDB() {
    db = await open({
        filename: './banco_steam.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS generos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS jogos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            ano INTEGER NOT NULL,
            genero_id INTEGER,
            FOREIGN KEY (genero_id) REFERENCES generos(id)
        );
    `);
    
    const check = await db.get('SELECT COUNT(*) as total FROM jogos');
    if (check.total === 0) {
        console.log("⚙️ Criando banco da Steam e inserindo seus 20 jogos iniciais...");
        await db.run(`INSERT INTO generos (nome) VALUES ('Terror / Survival'), ('Luta'), ('RPG'), ('Ação'), ('Indie / Plataforma'), ('FPS')`);
        
        const insertJogo = await db.prepare(`INSERT INTO jogos (titulo, ano, genero_id) VALUES (?, ?, ?)`);
        const jogosData = [
            ['Resident evil 2', 2019, 1], ['Resident evil 4', 2023, 1], ['Resident evil biohazard', 2017, 1],
            ['Resident evil Village', 2021, 1], ['Resident evil Requiem', 2022, 1], ['Dragon ball fighterZ', 2018, 2],
            ['Elden ring', 2022, 3], ['Mortal kombat 11', 2019, 2], ['Mortal kombat 1(12)', 2023, 2],
            ['Hogwarts Legacy', 2023, 3], ['Five night at Freddys', 2014, 1], ['Devour', 2021, 1],
            ['Devil may cry', 2019, 4], ['Cybepunk 2077', 2020, 3], ['Batman arkhan night', 2015, 4],
            ['Counter strike 2', 2023, 6], ['Cuphead', 2017, 5], ['Hades', 2020, 5],
            ['Hollow knight', 2017, 5], ['Hollow knight Silksong', 2025, 5]
        ];

        for (let j of jogosData) {
            await insertJogo.run(j[0], j[1], j[2]);
        }
        await insertJogo.finalize();
    }
}
setupDB();

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ erro: "Acesso negado. Faça login para obter o Token." });

    jwt.verify(token, SECRET_KEY, (err, usuario) => {
        if (err) return res.status(403).json({ erro: "Token inválido ou expirado." });
        req.usuario = usuario;
        next(); 
    });
}

app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;
    
    if (usuario === "lucas" && senha === "123456") {
        const token = jwt.sign({ nome: "Lucas" }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ mensagem: "Login bem-sucedido!", token });
    }
    res.status(401).json({ erro: "Credenciais inválidas." });
});

app.get('/api/jogos', async (req, res) => {
    try {
        let { ano, sort = 'titulo', order = 'ASC', page = 1, limit = 5 } = req.query;
        let query = `SELECT jogos.id, jogos.titulo, jogos.ano, generos.nome AS genero FROM jogos JOIN generos ON jogos.genero_id = generos.id WHERE 1=1`;
        let params = [];

        if (ano) { query += ` AND jogos.ano = ?`; params.push(ano); }

        const colunasValidas = ['titulo', 'ano'];
        if (!colunasValidas.includes(sort)) sort = 'titulo';
        order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY jogos.${sort} ${order}`;

        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const jogos = await db.all(query, params);
        res.status(200).json({ pagina: parseInt(page), limite: parseInt(limit), resultados: jogos });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

app.post('/api/jogos', verificarToken, async (req, res) => {
    const { titulo, ano, genero_id } = req.body;
    if (!titulo || !ano || !genero_id) return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
    if (typeof ano !== 'number' || ano < 1950) return res.status(422).json({ erro: "Ano inválido." });

    try {
        const result = await db.run(`INSERT INTO jogos (titulo, ano, genero_id) VALUES (?, ?, ?)`, [titulo, ano, genero_id]);
        res.status(201).json({ id: result.lastID, titulo, ano, genero_id });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao salvar no banco." });
    }
});

app.put('/api/jogos/:id', verificarToken, async (req, res) => {
    const { titulo, ano, genero_id } = req.body;
    if (!titulo || !ano || !genero_id) return res.status(400).json({ erro: "Campos incompletos." });

    try {
        const result = await db.run(`UPDATE jogos SET titulo = ?, ano = ?, genero_id = ? WHERE id = ?`, [titulo, ano, genero_id, req.params.id]);
        if (result.changes === 0) return res.status(404).json({ erro: "Jogo não encontrado." });
        res.status(200).json({ mensagem: "Jogo atualizado!" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar." });
    }
});

app.delete('/api/jogos/:id', verificarToken, async (req, res) => {
    try {
        const result = await db.run(`DELETE FROM jogos WHERE id = ?`, [req.params.id]);
        if (result.changes === 0) return res.status(404).json({ erro: "Jogo não encontrado." });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Steam rodando na porta ${PORT}`);
});