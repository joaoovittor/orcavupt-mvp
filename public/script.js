/*
  OrçaVupt - JavaScript do front-end

  Responsabilidades:
  1. Alternar entre a área do cliente e a área do profissional.
  2. Buscar pedidos na API Express.
  3. Enviar novos pedidos e orçamentos usando fetch().

  O servidor deve estar iniciado (npm start) para as chamadas funcionarem.
*/

const imagensPorCategoria = {
  Eletricista: "img/eletricista.png",
  Pintor: "img/pintor.png",
  Pedreiro: "img/pedreiro.png",
  "Técnico de Ar-Condicionado": "img/tecnico.png",
};

const API_URL = "/api/pedidos";

const tabCliente = document.getElementById("tab-cliente");
const tabProfissional = document.getElementById("tab-profissional");
const areaCliente = document.getElementById("area-cliente");
const areaProfissional = document.getElementById("area-profissional");

const formularioCliente = document.getElementById("form-pedido-cliente");
const mensagemCliente = document.getElementById("mensagem-cliente");
const fotoCliente = document.getElementById("foto-cliente");
const previewFoto = document.getElementById("foto-preview");
const imagemPreviewFoto = document.getElementById("foto-preview-image");
const nomePreviewFoto = document.getElementById("foto-preview-name");
const removerFoto = document.getElementById("remover-foto");
const listaCliente = document.getElementById("lista-pedidos-cliente");
const listaProfissional = document.getElementById("lista-pedidos-profissional");
const filtroCategoria = document.getElementById("filtro-categoria");
const contadorPedidos = document.getElementById("contador-pedidos");

let urlPreviewFoto;

function limparFotoSelecionada() {
  fotoCliente.value = "";
  if (urlPreviewFoto) URL.revokeObjectURL(urlPreviewFoto);
  urlPreviewFoto = null;
  imagemPreviewFoto.removeAttribute("src");
  nomePreviewFoto.textContent = "";
  previewFoto.classList.add("hidden");
}

fotoCliente.addEventListener("change", () => {
  const arquivo = fotoCliente.files[0];
  if (!arquivo) {
    limparFotoSelecionada();
    return;
  }

  if (urlPreviewFoto) URL.revokeObjectURL(urlPreviewFoto);
  urlPreviewFoto = URL.createObjectURL(arquivo);
  imagemPreviewFoto.src = urlPreviewFoto;
  nomePreviewFoto.textContent = arquivo.name;
  previewFoto.classList.remove("hidden");
});
removerFoto.addEventListener("click", limparFotoSelecionada);
formularioCliente.addEventListener("reset", limparFotoSelecionada);

function aprimorarSelect(select) {
  const label = select.labels[0];
  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";
  select.parentNode.insertBefore(wrapper, select);
  wrapper.append(select);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  trigger.id = `${select.id}-trigger`;
  label.htmlFor = trigger.id;
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-required", String(select.required));
  if (!label.id) label.id = `${select.id}-label`;

  const selectedText = document.createElement("span");
  selectedText.id = `${select.id}-selected`;
  trigger.setAttribute("aria-labelledby", `${label.id} ${selectedText.id}`);
  const arrow = document.createElement("span");
  arrow.className = "custom-select-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "⌄";
  trigger.append(selectedText, arrow);

  const listbox = document.createElement("div");
  listbox.className = "custom-select-menu";
  listbox.id = `${select.id}-options`;
  listbox.setAttribute("role", "listbox");
  listbox.setAttribute("aria-labelledby", label.id);
  trigger.setAttribute("aria-controls", listbox.id);

  const optionButtons = Array.from(select.options, (option, index) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "custom-select-option";
    optionButton.setAttribute("role", "option");
    optionButton.setAttribute("aria-selected", String(option.selected));
    optionButton.disabled = option.disabled;
    optionButton.textContent = option.textContent.trim();
    optionButton.addEventListener("click", () => {
      select.selectedIndex = index;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      wrapper.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    });
    listbox.append(optionButton);
    return optionButton;
  });

  function sincronizarSelecao() {
    selectedText.textContent =
      select.selectedOptions[0]?.textContent.trim() || "";
    optionButtons.forEach((optionButton, index) => {
      optionButton.setAttribute(
        "aria-selected",
        String(index === select.selectedIndex),
      );
    });
    wrapper.classList.remove("invalid");
    trigger.removeAttribute("aria-invalid");
  }

  function fecharLista() {
    wrapper.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  }

  function abrirLista(focarOpcao = false) {
    document.querySelectorAll(".custom-select.open").forEach((openWrapper) => {
      openWrapper.classList.remove("open");
      openWrapper
        .querySelector(".custom-select-trigger")
        ?.setAttribute("aria-expanded", "false");
    });
    wrapper.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    if (focarOpcao) {
      const selectedOption = optionButtons[select.selectedIndex];
      (selectedOption && !selectedOption.disabled
        ? selectedOption
        : optionButtons.find((optionButton) => !optionButton.disabled)
      )?.focus();
    }
  }

  trigger.addEventListener("click", () => {
    if (wrapper.classList.contains("open")) {
      fecharLista();
    } else {
      abrirLista();
    }
  });
  trigger.addEventListener("keydown", (evento) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(evento.key)) {
      evento.preventDefault();
      abrirLista(true);
    }
  });
  listbox.addEventListener("keydown", (evento) => {
    const enabledOptions = optionButtons.filter(
      (optionButton) => !optionButton.disabled,
    );
    const currentIndex = enabledOptions.indexOf(document.activeElement);
    if (evento.key === "Escape") {
      evento.preventDefault();
      fecharLista();
      trigger.focus();
    } else if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      const direction = evento.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        (currentIndex + direction + enabledOptions.length) %
        enabledOptions.length;
      enabledOptions[nextIndex]?.focus();
    } else if (evento.key === "Home" || evento.key === "End") {
      evento.preventDefault();
      enabledOptions[
        evento.key === "Home" ? 0 : enabledOptions.length - 1
      ]?.focus();
    }
  });

  select.classList.add("native-select-hidden");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");
  if (select.required && select.form) {
    select.required = false;
    select.form.addEventListener(
      "submit",
      (evento) => {
        if (select.value) return;
        evento.preventDefault();
        evento.stopImmediatePropagation();
        wrapper.classList.add("invalid");
        trigger.setAttribute("aria-invalid", "true");
        abrirLista(true);
      },
      true,
    );
  }
  select.addEventListener("change", sincronizarSelecao);
  select.form?.addEventListener("reset", () => {
    setTimeout(() => {
      sincronizarSelecao();
      fecharLista();
    });
  });
  document.addEventListener("click", (evento) => {
    if (!wrapper.contains(evento.target)) fecharLista();
  });

  wrapper.prepend(trigger, listbox);
  sincronizarSelecao();
}

aprimorarSelect(document.getElementById("categoria-cliente"));
aprimorarSelect(filtroCategoria);

function mostrarArea(tipo) {
  const clienteAtivo = tipo === "cliente";

  areaCliente.classList.toggle("hidden", !clienteAtivo);
  areaProfissional.classList.toggle("hidden", clienteAtivo);
  tabCliente.classList.toggle("active", clienteAtivo);
  tabProfissional.classList.toggle("active", !clienteAtivo);

  tabCliente.setAttribute("aria-selected", String(clienteAtivo));
  tabProfissional.setAttribute("aria-selected", String(!clienteAtivo));
}

tabCliente.addEventListener("click", () => mostrarArea("cliente"));
tabProfissional.addEventListener("click", () => mostrarArea("profissional"));

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

async function carregarPedidos() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Não foi possível carregar os pedidos.");

    const pedidos = await resposta.json();
    renderizarPedidos(pedidos);
  } catch (erro) {
    listaCliente.innerHTML =
      '<p class="empty-state">Não foi possível carregar os pedidos. Confira se o servidor está rodando.</p>';
    listaProfissional.innerHTML =
      '<p class="empty-state">Não foi possível carregar os pedidos. Confira se o servidor está rodando.</p>';
    contadorPedidos.textContent = "API indisponível";
    console.error(erro);
  }
}

function renderizarPedidos(pedidos) {
  listaCliente.replaceChildren();
  listaProfissional.replaceChildren();

  contadorPedidos.textContent = `${pedidos.length} pedido(s) cadastrado(s)`;

  if (pedidos.length === 0) {
    listaCliente.append(
      criarElemento("p", "empty-state", "Você ainda não cadastrou pedidos."),
    );
    listaProfissional.append(
      criarElemento("p", "empty-state", "Ainda não há pedidos disponíveis."),
    );
    return;
  }

  pedidos.forEach((pedido) => {
    const cardCliente = criarElemento("article", "quote-card");
    const informacoes = document.createElement("div");
    informacoes.append(
      criarElemento("span", "tag", pedido.categoria),
      criarElemento("h3", "", pedido.descricao),
      criarElemento(
        "p",
        "subtitle",
        `${pedido.local} · Pedido #${pedido.id.slice(0, 6)}`,
      ),
    );

    if (pedido.orcamentos && pedido.orcamentos.length > 0) {
      pedido.orcamentos.forEach((orcamento) => {
        const linha = criarElemento("div", "quote-info");
        linha.append(
          criarElemento("span", "", `👤 ${orcamento.profissional}`),
          criarElemento("span", "", `🕒 Prazo: ${orcamento.prazo}`),
        );
        informacoes.append(linha);

        const preco = criarElemento(
          "div",
          "quote-price",
          formatarMoeda(orcamento.valor),
        );
        preco.append(criarElemento("small", "", "Valor do orçamento"));
        cardCliente.append(informacoes, preco);
        listaCliente.append(cardCliente);
      });
    } else {
      informacoes.append(
        criarElemento(
          "div",
          "quote-info",
          "Aguardando orçamentos dos profissionais.",
        ),
      );
      cardCliente.append(informacoes);
      listaCliente.append(cardCliente);
    }

    const cardProfissional = document.createElement("article");
    cardProfissional.className = "order-card";
    cardProfissional.dataset.categoria = pedido.categoria;

    const foto = criarElemento("div", "order-photo", "");
    const imagem = document.createElement("img");

    const imagemPadraoCategoria =
      imagensPorCategoria[pedido.categoria] || "img/eletricista.png";

    imagem.src = imagemPadraoCategoria;
    imagem.alt = `Serviço de ${pedido.categoria}`;

    foto.append(imagem);

    const corpo = criarElemento("div", "order-body");
    const meta = criarElemento("div", "order-meta");
    const descricao = criarElemento(
      "p",
      "order-description",
      "Envie seu valor e prazo para atender este pedido.",
    );
    meta.append(
      criarElemento("span", "tag", pedido.categoria),
      criarElemento("span", "tag", pedido.local),
    );
    corpo.append(meta, criarElemento("h3", "", pedido.descricao));

    if (pedido.foto) {
      const figuraFotoProblema = criarElemento(
        "figure",
        "order-problem-photo",
      );
      const imagemProblema = document.createElement("img");
      imagemProblema.src = pedido.foto;
      imagemProblema.alt = `Foto enviada pelo cliente para o pedido de ${pedido.categoria}`;
      figuraFotoProblema.append(
        imagemProblema,
        criarElemento("figcaption", "", "Foto enviada pelo cliente"),
      );
      corpo.append(figuraFotoProblema);
    }
    corpo.append(descricao);

    const form = document.createElement("form");
    form.className = "inline-form";
    form.innerHTML = `
      <div class="field">
        <label>Nome / Empresa</label>
        <input name="profissional" type="text" placeholder="Seu nome ou empresa" required>
      </div>
      <div class="field">
        <label>Valor (R$)</label>
        <input name="valor" type="number" min="0.01" step="0.01" placeholder="180,00" required>
      </div>
      <div class="field">
        <label>Prazo</label>
        <input name="prazo" type="text" placeholder="Ex.: amanhã" required>
      </div>
      <button class="primary-button" type="submit">Enviar Orçamento</button>
    `;

    form.addEventListener("submit", (evento) =>
      enviarOrcamento(evento, pedido.id),
    );
    corpo.append(form);
    cardProfissional.append(foto, corpo);
    listaProfissional.append(cardProfissional);
  });

  aplicarFiltro();
}

function aplicarFiltro() {
  const categoria = filtroCategoria.value;

  document.querySelectorAll(".order-card").forEach((card) => {
    const corresponde =
      categoria === "todos" || card.dataset.categoria === categoria;
    card.classList.toggle("hidden", !corresponde);
  });
}

filtroCategoria.addEventListener("change", aplicarFiltro);

formularioCliente.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagemCliente.textContent = "Enviando pedido...";

  const dados = new FormData(formularioCliente);
  const fotoSelecionada = dados.get("foto");
  if (!fotoSelecionada || !fotoSelecionada.size) dados.delete("foto");

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      body: dados,
    });

    const resultado = await resposta.json();
    if (!resposta.ok)
      throw new Error(resultado.erro || "Erro ao cadastrar pedido.");

    formularioCliente.reset();
    mensagemCliente.textContent = "Pedido cadastrado com sucesso!";
    await carregarPedidos();
  } catch (erro) {
    mensagemCliente.textContent = erro.message;
    console.error(erro);
  }
});

async function enviarOrcamento(evento, pedidoId) {
  evento.preventDefault();

  const formulario = evento.currentTarget;
  const dados = new FormData(formulario);
  const orcamento = {
    profissional: dados.get("profissional"),
    valor: Number(dados.get("valor")),
    prazo: dados.get("prazo"),
  };

  const botao = formulario.querySelector("button");
  botao.disabled = true;
  botao.textContent = "Enviando...";

  try {
    const resposta = await fetch(`${API_URL}/${pedidoId}/orcamentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orcamento),
    });

    const resultado = await resposta.json();
    if (!resposta.ok)
      throw new Error(resultado.erro || "Não foi possível enviar o orçamento.");

    await carregarPedidos();
  } catch (erro) {
    alert(erro.message);
    botao.disabled = false;
    botao.textContent = "Enviar Orçamento";
    console.error(erro);
  }
}

carregarPedidos();
