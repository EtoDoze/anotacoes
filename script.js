const webservice= "https://anotacoes-backend.onrender.com" //"http://localhost:3000"


// frontend/js/app.js
document.addEventListener('DOMContentLoaded', () => {
  const novaNotaBtn = document.getElementById('novaNotaBtn');
  const editorContainer = document.getElementById('editorContainer');
  const notasContainer = document.getElementById('notasContainer');
  const notaTitulo = document.getElementById('notaTitulo');
  const notaConteudo = document.getElementById('notaConteudo');
  const salvarNotaBtn = document.getElementById('salvarNotaBtn');
  const cancelarNotaBtn = document.getElementById('cancelarNotaBtn');

  let notaAtualId = null;

  // Carregar notas ao iniciar
  carregarNotas();

  // Mostrar editor para nova nota
  novaNotaBtn.addEventListener('click', () => {
    notaAtualId = null;
    notaTitulo.value = '';
    notaConteudo.value = '';
    editorContainer.style.display = 'block';
  });

  // Cancelar edição
  cancelarNotaBtn.addEventListener('click', () => {
    editorContainer.style.display = 'none';
  });

  // Salvar nota
  salvarNotaBtn.addEventListener('click', async () => {
    const titulo = notaTitulo.value.trim();
    const conteudo = notaConteudo.value.trim();

    if (!titulo || !conteudo) {
      alert('Preencha título e conteúdo!');
      return;
    }

    try {
      if (notaAtualId) {
        // Atualizar nota existente
        await atualizarNota(notaAtualId, titulo, conteudo);
      } else {
        // Criar nova nota
        await criarNota(titulo, conteudo);
      }

      // Limpar e esconder editor
      notaTitulo.value = '';
      notaConteudo.value = '';
      editorContainer.style.display = 'none';

      // Recarregar notas
      carregarNotas();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Erro ao salvar nota');
    }
  });

  // Função para carregar notas
// Substitua a função atual por:
async function carregarNotas() {
  try {
    const response = await fetch(`${webservice}/all`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const notas = await response.json();
    renderizarNotas(notas);
    
  } catch (error) {
    console.error('Erro detalhado:', error);
    notasContainer.innerHTML = `
      <div class="error">
        <p>Erro ao carregar notas</p>
        <p>${error.message}</p>
        <button class="tentar-novamente-btn">Tentar novamente</button>
      </div>
    `;
  }
}


  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('tentar-novamente-btn')) {
      carregarNotas();
    }
    
    // Adicione também para os botões de editar/deletar
    if (event.target.classList.contains('editar-btn')) {
      editarNota(event);
    }
    
    if (event.target.classList.contains('deletar-btn')) {
      deletarNota(event);
    }
  });

  // Função para criar nova nota
  async function criarNota(titulo, conteudo) {
    const response = await fetch('http://localhost:3000/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ titulo, conteudo })
    });

    return await response.json();
  }

  // Função para editar nota
// Função para editar nota (CORRIGIDA)
async function editarNota(event) {
    const notaId = event.target.getAttribute('data-id');
    
    try {
        const response = await fetch(`${webservice}/edit/${notaId}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Erro: ${response.status}`);
        }

        const nota = await response.json();
        
        if (!nota || !nota.id) {
            throw new Error('Nota não encontrada');
        }

        notaAtualId = nota.id;
        notaTitulo.value = nota.titulo;
        notaConteudo.value = nota.conteudo;
        editorContainer.style.display = 'block';
        
    } catch (error) {
        console.error('Erro ao editar:', error);
        notasContainer.innerHTML = `
            <div class="error">
                <p>Falha ao carregar nota</p>
                <p>${error.message}</p>
                <button class="tentar-novamente-btn">Tentar novamente</button>
            </div>
        `;
    }
}


  // Função para atualizar nota
// Função para atualizar nota (CORRIGIDA)
async function atualizarNota(id, titulo, conteudo) {
    try {
        const response = await fetch(`${webservice}/edit/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, conteudo })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Erro HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao atualizar nota:', error);
        throw error; // Re-lança o erro para ser tratado pelo chamador
    }
}

  // Função para deletar nota
  async function deletarNota(event) {
    const notaId = event.target.getAttribute('data-id');
    
    if (!confirm('Tem certeza que deseja deletar esta nota?')) {
      return;
    }

    try {
      await fetch(`http://localhost:3000/del/${notaId}`, {
        method: 'DELETE'
      });

      // Recarregar notas após deletar
      carregarNotas();
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
      alert('Erro ao deletar nota');
    }
  }
});

function renderizarNotas(notas) {
  notasContainer.innerHTML = '';

  if (notas.length === 0) {
    notasContainer.innerHTML = '<p>Nenhuma nota encontrada. Crie uma nova nota!</p>';
    return;
  }

  notas.forEach(nota => {
    const notaElement = document.createElement('div');
    notaElement.className = 'nota';
    notaElement.innerHTML = `
      <h3>${nota.titulo}</h3>
      <p>${nota.conteudo}</p>
      <div class="nota-botoes">
        <button class="editar-btn" data-id="${nota.id}">Editar</button>
        <button class="deletar-btn" data-id="${nota.id}">Deletar</button>
      </div>
    `;
    notasContainer.appendChild(notaElement);
  });
}