# 🎮 API Steam - Projeto Final (Node.js + SQLite)

**Aluno:** Lucas  
**Matrícula:** 251072046  
**Curso:** Engenharia de Software - Centro Universitário Filadélfia (UniFil)  

## 🚀 Sobre o Projeto
Esta é uma API RESTful completa desenvolvida para gerenciar uma biblioteca de jogos da Steam. O projeto atende a todos os requisitos do Projeto Final da disciplina, utilizando banco de dados relacional e garantindo a segurança das operações com Autenticação JWT.

## 🛠️ Tecnologias e Requisitos Atendidos
- **Node.js + Express:** Estrutura base da API.
- **SQLite:** Banco de dados relacional, inicializado automaticamente com 20 registros reais da minha biblioteca da Steam.
- **Relacionamentos (JOINs):** Tabela de `jogos` vinculada com a tabela de `generos` (1:N).
- **Consultas Avançadas:** Implementação de Paginação (`limit`, `page`), Ordenação (`sort`, `order`) e Filtros (`ano`) na rota GET.
- **Autenticação (JWT):** Rotas de POST, PUT e DELETE protegidas por token de acesso.
- **Validações e Tratamento de Erros:** Status codes adequados (200, 201, 204, 400, 401, 403, 404, 422) e bloqueio de dados incorretos.

## 📦 Como rodar o projeto localmente

1. Clone este repositório:
   ```bash
   git clone <LINK_DO_SEU_REPOSITORIO>