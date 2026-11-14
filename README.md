# ⚡ OrçaVupt — MVP

Plataforma hiperlocal de **Orçamento Relâmpago** desenvolvida como MVP no curso Técnico em Informática para a Internet (SENAI - Ponte Nova).

## 💡 O Problema e a Solução

- **Problema:** Quando alguém precisa de um eletricista, pintor, pedreiro ou técnico de ar-condicionado, perde horas mandando mensagem para vários profissionais diferentes esperando retorno.
- **Solução:** No **OrçaVupt**, o cliente descreve o serviço em 3 cliques, envia uma foto do problema e os profissionais locais enviam orçamentos e prazos diretamente no mural ao vivo.
- **Modelo de Negócio:** Organização do mercado informal local por meio de assinatura acessível para prestadores de serviço da cidade terem acesso direto aos pedidos da região.

## ✨ Funcionalidades do MVP

- Criação rápida de pedidos por categoria (Eletricista, Pintor, Pedreiro, Técnico de Ar-Condicionado)
- Upload e exibição de foto do problema (com fallback automático de ilustração por categoria)
- Mural ao vivo com envio instantâneo de orçamentos e prazos pelos profissionais
- Persistência de dados local via Node.js

## 🛠️ Tecnologias Utilizadas

- **Front-end:** HTML5, CSS3 e JavaScript (Vanilla JS com Fetch API)
- **Back-end:** Node.js e Express
- **Persistência (MVP):** Armazenamento local em arquivo JSON (`data/pedidos.json`) via módulo nativo `fs`

## 🚀 Como rodar o projeto na sua máquina

1. Clone este repositório:
   ```bash
   git clone  https://github.com/joaoovittor/orcavupt-mvp.git
   ```
2. Acesse a pasta do projeto e instale as dependências:
   ```bash
   cd orcavupt-mvp
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
4. Abra no navegador: `http://localhost:3000`

## 🗺️ Próximos Passos (Versão 2.0)

- Sistema de autenticação e login para clientes e prestadores
- Perfil completo dos profissionais com histórico e avaliações (estilo Uber)
- Migração do armazenamento JSON para banco de dados relacional (MySQL/PostgreSQL)

---

_Desenvolvido em um sprint focado de 4 horas com auxílio de IA como copiloto de código para prototipagem rápida._
