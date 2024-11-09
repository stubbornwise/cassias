import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions, FlatList, Modal } from 'react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const App = () => {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [showProdutos, setShowProdutos] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id_produto: '',
    nome_produto: '',
    valor: '',
    quantidade: '',
    marca: ''
  });
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    if (showProdutos) {
      fetchProdutos();
    }
  }, [showProdutos]);

  const handleLogin = () => {
    axios.post('http://192.168.15.10:3001/login', { username, senha })
      .then(response => {
        if (response.data.success) {
          setLoggedIn(true);
          setUserDetails(response.data.data);
        } else {
          console.log('Erro', 'Credenciais inválidas');
        }
      })
      .catch(error => {
        console.error('Erro ao conectar ao servidor:', error.message);
        console.log('Erro', 'Ocorreu um erro na conexão com o servidor.');
      });
  };

  const fetchProdutos = () => {
    axios.get('http://192.168.15.10:3001/produtos')
      .then(response => {
        setProdutos(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar produtos:', error.message);
        console.log('Erro', 'Não foi possível carregar os produtos.');
      });
  };

  const handleEdit = (produto) => {
    setEditingProduct(produto);
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    const { id_produto, nome_produto, valor, quantidade, marca } = editingProduct;
    axios.put(`http://192.168.15.10:3001/produtos/${id_produto}`, { nome_produto, valor, quantidade, marca })
      .then(() => {
        console.log('Sucesso', 'Produto atualizado com sucesso.');
        setModalVisible(false);
        fetchProdutos();
      })
      .catch(error => {
        console.error('Erro ao atualizar o produto:', error.message);
        console.log('Erro', 'Não foi possível atualizar o produto.');
      });
  };

  const handleDelete = (id_produto) => {
    axios.delete(`http://192.168.15.10:3001/produtos/${id_produto}`)
      .then(response => {
        if (response.status === 200) {
          setProdutos((prevProdutos) => prevProdutos.filter(item => item.id_produto !== id_produto));
          console.log('Sucesso', 'Produto excluído com sucesso.');
        } else {
          console.log('Erro', 'Falha ao excluir o produto.');
        }
      })
      .catch(error => {
        console.error('Erro ao excluir o produto:', error.message);
        console.log('Erro', 'Não foi possível excluir o produto.');
      });
  };

  const handleAddProduct = () => {
    const { id_produto, nome_produto, valor, quantidade, marca } = newProduct;
    axios.post('http://192.168.15.10:3001/produtos', { id_produto, nome_produto, valor, quantidade, marca })
      .then(() => {
        console.log('Sucesso', 'Produto adicionado com sucesso.');
        setAddModalVisible(false);
        fetchProdutos();
        setNewProduct({ id_produto: '', nome_produto: '', valor: '', quantidade: '', marca: '' });
      })
      .catch(error => {
        console.error('Erro ao adicionar o produto:', error.message);
        console.log('Erro', 'Não foi possível adicionar o produto.');
      });
  };

  const ProdutosScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Produtos</Text>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id_produto.toString()}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Text style={styles.productText}>ID: {item.id_produto}</Text>
            <Text style={styles.productText}>Nome: {item.nome_produto}</Text>
            <Text style={styles.productText}>Valor: R$ {item.valor}</Text>
            <Text style={styles.productText}>Quantidade: {item.quantidade}</Text>
            <Text style={styles.productText}>Marca: {item.marca}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id_produto)}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.emptyMessage}>Nenhum produto disponível.</Text>}
      />

      <TouchableOpacity style={styles.button} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.buttonText}>Adicionar Produto</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setShowProdutos(false)}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Editar Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Produto"
              value={editingProduct?.nome_produto}
              onChangeText={(text) => setEditingProduct({ ...editingProduct, nome_produto: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor"
              keyboardType="numeric"
              value={String(editingProduct?.valor)}
              onChangeText={(text) => setEditingProduct({ ...editingProduct, valor: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              keyboardType="numeric"
              value={String(editingProduct?.quantidade)}
              onChangeText={(text) => setEditingProduct({ ...editingProduct, quantidade: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Marca"
              value={editingProduct?.marca}
              onChangeText={(text) => setEditingProduct({ ...editingProduct, marca: text })}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleSaveEdit}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Adicionar Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Produto"
              value={newProduct.nome_produto}
              onChangeText={(text) => setNewProduct({ ...newProduct, nome_produto: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor"
              keyboardType="numeric"
              value={newProduct.valor}
              onChangeText={(text) => setNewProduct({ ...newProduct, valor: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              keyboardType="numeric"
              value={newProduct.quantidade}
              onChangeText={(text) => setNewProduct({ ...newProduct, quantidade: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Marca"
              value={newProduct.marca}
              onChangeText={(text) => setNewProduct({ ...newProduct, marca: text })}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleAddProduct}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      {loggedIn ? (
        showProdutos ? (
          <ProdutosScreen />
        ) : (
          <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo, {userDetails?.nome}</Text>
            <TouchableOpacity style={styles.button} onPress={() => setShowProdutos(true)}>
              <Text style={styles.buttonText}>Produtos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setLoggedIn(false)}>
              <Text style={styles.buttonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuário"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senha}
            secureTextEntry
            onChangeText={setSenha}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5a195d',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'white',
  },
  input: {
    width: width * 0.8,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: 'black',
  },
  button: {
    backgroundColor: '#a17b28',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: width * 0.8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginVertical: 5,
    borderRadius: 5,
  },
  productText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FFA726',
  },
  deleteButton: {
    backgroundColor: '#EF5350',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'gray',
  },
});

export default App;
