const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());  // Habilita o CORS para permitir requisições de diferentes origens

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost', // ou o IP local da sua máquina, por exemplo, '192.168.x.x'
  user: 'root',
  password: '',
  database: 'cassias'
});

// Conectar ao banco de dados
db.connect(err => {
  if (err) {
    console.log('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados');
});

// Endpoint de login
app.post('/login', (req, res) => {
  const { username, senha } = req.body;
  console.log('Login recebido:', req.body);

  db.query('SELECT * FROM usuarios WHERE username = ? AND senha = ?', [username, senha], (err, results) => {
    if (err) {
      console.log('Erro ao consultar banco de dados:', err);
      return res.status(500).send({ success: false, message: 'Erro no servidor' });
    }

    if (results.length > 0) {
      const user = results[0];
      res.send({
        success: true,
        data: {
          username: user.username,
          endereco: user.endereco,
          telefone: user.telefone,
          cpf: user.cpf
        }
      });
    } else {
      res.send({ success: false, message: 'Credenciais inválidas' });
    }
  });
});

// Endpoint para listar os produtos
app.get('/produtos', (req, res) => {
  db.query('SELECT id_produto, nome_produto, valor, quantidade, marca FROM produtos', (err, results) => {
    if (err) {
      console.log('Erro ao consultar produtos:', err);
      return res.status(500).send({ success: false, message: 'Erro no servidor ao consultar produtos' });
    }
    res.send(results);  // Envia a lista de produtos para o frontend
  });
});

// Endpoint para editar um produto
app.put('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { nome_produto, valor, quantidade, marca } = req.body;

  console.log(`Recebendo dados para atualização do produto ${id}:`, req.body);

  const query = 'UPDATE produtos SET nome_produto = ?, valor = ?, quantidade = ?, marca = ? WHERE id_produto = ?';
  const values = [nome_produto, valor, quantidade, marca, id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.log('Erro ao editar produto:', err);
      return res.status(500).send({ success: false, message: 'Erro no servidor ao editar produto' });
    }

    console.log(`Produto ${id} atualizado com sucesso`);
    res.send({ success: true, message: 'Produto atualizado com sucesso' });
  });
});

// Endpoint para excluir um produto
app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Excluindo produto com ID: ${id}`);

  const query = 'DELETE FROM produtos WHERE id_produto = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.log('Erro ao excluir produto:', err);
      return res.status(500).send({ success: false, message: 'Erro no servidor ao excluir produto' });
    }

    if (result.affectedRows > 0) {
      console.log(`Produto ${id} excluído com sucesso`);
      // Após a exclusão, retornamos a lista atualizada de produtos
      db.query('SELECT id_produto, nome_produto, valor, quantidade, marca FROM produtos', (err, updatedResults) => {
        if (err) {
          console.log('Erro ao consultar produtos atualizados:', err);
          return res.status(500).send({ success: false, message: 'Erro ao consultar lista atualizada de produtos' });
        }
        res.send({ success: true, message: 'Produto excluído com sucesso', produtos: updatedResults });
      });
    } else {
      res.status(404).send({ success: false, message: 'Produto não encontrado' });
    }
  });
});

// Iniciar o servidor
app.listen(3001, () => {
  console.log('API rodando na porta 3001');
});
