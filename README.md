# 🎲 TTRPG Notes - Frontend

![TTRPG Notes](https://img.shields.io/badge/TTRPG-Notes-blue?style=for-the-badge&logo=dice&logoColor=white)
![Status](https://img.shields.io/badge/Status-Ativo-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## 📖 Sobre o Projeto

O **TTRPG Notes** é uma aplicação web frontend desenvolvida para organizar e gerenciar campanhas de RPG (Role-Playing Games) e suas respectivas sessões. Este projeto faz parte do **MVP da disciplina Desenvolvimento Full Stack Básico** da **Pós-Graduação em Desenvolvimento Full Stack da PUC-Rio**.

O sistema permite que mestres e jogadores de RPG mantenham um registro organizado de suas campanhas, criando notas detalhadas para cada sessão jogada, facilitando o acompanhamento da narrativa e evolução das histórias.

## 🎯 Funcionalidades

### ✅ Gestão de Campanhas
- **Criação de Campanhas**: Crie campanhas com nome e descrição
- **Listagem de Campanhas**: Visualize todas as campanhas na barra lateral
- **Seleção de Campanhas**: Navegue facilmente entre diferentes campanhas

### ✅ Gestão de Notas/Sessões
- **Criação de Notas**: Adicione notas detalhadas para cada sessão
- **Editor Rico**: Use o editor Quill.js com formatação avançada
- **Visualização Organizada**: Veja todas as notas organizadas por campanha
- **Cronologia**: Notas ordenadas por data de criação

### ✅ Sistema de Busca
- **Busca Global**: Procure por campanhas e notas simultaneamente
- **Busca Inteligente**: Busca no título e conteúdo das notas
- **Navegação Rápida**: Acesso direto aos resultados encontrados

### ✅ Interface e Experiência
- **Design Responsivo**: Interface adaptável para diferentes dispositivos
- **Feedback Visual**: Status de conexão e mensagens informativas
- **Atalhos de Teclado**: Agilize o uso com shortcuts úteis
- **Estados de Loading**: Feedback visual durante carregamento

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilização moderna e responsiva
- **JavaScript ES6+**: Lógica da aplicação e manipulação DOM
- **Quill.js**: Editor de texto rico para criação de conteúdo
- **Fetch API**: Comunicação com backend REST
- **CSS Grid/Flexbox**: Layout responsivo e moderno

## 🏗️ Arquitetura do Frontend

```
rpg_app_front/
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos e responsividade
├── scripts.js          # Lógica JavaScript da aplicação
└── README.md          # Documentação do projeto
```

### 📁 Estrutura de Arquivos

- **`index.html`**: Contém toda a estrutura HTML da aplicação, incluindo formulários, listas e áreas de conteúdo
- **`styles.css`**: Estilos CSS organizados para interface moderna e responsiva
- **`scripts.js`**: Lógica JavaScript modular com gerenciamento de estado, comunicação com API e manipulação de UI

## 🚀 Como Executar

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet (para carregar bibliotecas CDN)
- API Backend em execução (requerida para funcionalidade completa)

### Executando o Projeto

Basta fazer o download do projeto e abrir o arquivo `index.html` no seu browser.

```bash
# Método 1: Abertura direta
# Navegue até a pasta do projeto e abra index.html no browser

# Método 2: Servidor local (recomendado)
# Se tiver Python instalado:
python -m http.server 8000

# Se tiver Node.js instalado:
npx http-server

# Acesse: http://localhost:8000
```

> **⚠️ Importante**: Para funcionalidade completa, certifique-se de que a API backend esteja rodando na URL configurada (padrão: `http://localhost:5000`).

## 🎮 Como Utilizar

### 1️⃣ **Primeira Utilização**
1. Abra o `index.html` no seu navegador
2. Verifique o status de conexão no canto superior direito
3. Crie sua primeira campanha clicando em "➕ Nova" na barra lateral

### 2️⃣ **Criando uma Campanha**
```
📝 Exemplo de Campanha:
Nome: "Lost Mine of Phandelver"
Descrição: "Aventura inicial para D&D 5e com personagens nível 1-5"
```

### 3️⃣ **Adicionando Notas às Sessões**
1. Selecione uma campanha na barra lateral
2. Clique em "➕ Nova Nota"
3. Preencha os dados da sessão:

```
📋 Exemplo de Nota:
Título: "Sessão 1 - A Taverna do Javali Dourado"
Conteúdo: 
- Os aventureiros se conheceram na taverna
- Gundren Rockseeker os contratou para escoltar um carregamento
- Partiram pela Estrada do Triboar em direção a Phandalin
- Emboscada de goblins no caminho - cavalos mortos, Gundren capturado
```

### 4️⃣ **Buscando Conteúdo**
- Use a barra de busca no topo para encontrar campanhas ou notas
- Digite termos como "taverna", "goblin" ou nome de NPCs
- Clique nos resultados para navegar diretamente

### 5️⃣ **Atalhos Úteis**
- **Ctrl + Enter**: Salvar nota atual
- **Ctrl + N**: Criar nova nota (com campanha selecionada)
- **Escape**: Cancelar formulários
- **Enter**: Ações contextuais em campos

## 🔌 Integração com API

O frontend comunica-se com uma API REST backend através dos seguintes endpoints:

### Campanhas
- `GET /campaigns` - Lista todas as campanhas
- `POST /campaigns` - Cria nova campanha
- `GET /campaigns/<int:campaign_id>` - Busca campanha específica

### Notas
- `POST /notes` - Cria nova nota
- `GET /notes` - Lista todas as notas
- `GET /campaigns/<string:campaign_name>/notes` - Lista notas de uma campanha

## 🎨 Características da Interface

### 🌟 **Design Moderno**
- Interface limpa e intuitiva
- Cores contrastantes para boa legibilidade
- Ícones emoji para identificação rápida
- Animações suaves e feedback visual

### 📱 **Responsividade**
- Layout adaptável para desktop, tablet e mobile
- Sidebar colapsável em telas menores
- Formulários otimizados para touch

### ⚡ **Performance**
- Carregamento rápido com CDN
- Estados de loading para melhor UX
- Otimização de requests à API

## 🏫 Contexto Acadêmico

Este projeto foi desenvolvido como parte dos requisitos da disciplina **Desenvolvimento Full Stack Básico** da **Pós-Graduação em Desenvolvimento Full Stack** da **PUC-Rio**. 

### 📚 Objetivos Pedagógicos
- Aplicação prática de HTML, CSS e JavaScript
- Integração frontend-backend via APIs REST
- Implementação de interface responsiva
- Gerenciamento de estado em aplicações web
- Boas práticas de desenvolvimento frontend

### 🎯 MVP (Minimum Viable Product)
O projeto representa um MVP funcional que demonstra:
- Operações CRUD via frontend
- Comunicação assíncrona com backend
- Interface de usuário moderna e responsiva
- Tratamento de erros e estados de loading
- Experiência de usuário fluida e intuitiva

## 👤 Autor

**Fabio Silva**  
Estudante de Pós-Graduação em Desenvolvimento Full Stack - PUC-Rio  
Disciplina: Desenvolvimento Full Stack Básico

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**🎲 Feito com ❤️ para a comunidade de RPG**

*"A imaginação é a única arma na guerra contra a realidade"* 🐉

</div>