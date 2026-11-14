/*
  OrçaVupt - servidor Express

  Este servidor:
  1. Entrega os arquivos da pasta public.
  2. Lista os pedidos salvos em data/pedidos.json.
  3. Cadastra novos pedidos.
  4. Adiciona orçamentos aos pedidos existentes.
  5. Armazena imagens enviadas pelos clientes.

  Para iniciar:
    npm install
    npm start
*/

const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { randomUUID } = require("crypto");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

const ARQUIVO_PEDIDOS = path.join(__dirname, "data", "pedidos.json");
const DIRETORIO_UPLOADS = path.join(__dirname, "public", "uploads");
const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: TAMANHO_MAXIMO_IMAGEM,
    files: 1,
    fields: 3,
    parts: 4,
  },
  fileFilter(req, file, callback) {
    if (
      file.mimetype.startsWith("image/") ||
      /\.jfif$/i.test(file.originalname)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Envie um arquivo de imagem válido."));
    }
  },
});

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

function detectarExtensaoImagem(arquivo) {
  if (
    arquivo.length >= 8 &&
    arquivo.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return "png";
  }
  if (
    arquivo.length >= 3 &&
    arquivo[0] === 255 &&
    arquivo[1] === 216 &&
    arquivo[2] === 255
  ) {
    return "jpg";
  }
  if (
    arquivo.length >= 12 &&
    arquivo.toString("ascii", 0, 4) === "RIFF" &&
    arquivo.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  if (
    arquivo.length >= 6 &&
    ["GIF87a", "GIF89a"].includes(arquivo.toString("ascii", 0, 6))
  ) {
    return "gif";
  }
  return null;
}

function tratarErroUpload(erro, req, res, next) {
  if (!erro) return next();

  if (erro instanceof multer.MulterError) {
    const mensagem =
      erro.code === "LIMIT_FILE_SIZE"
        ? "A imagem deve ter no máximo 5 MB."
        : "Envie apenas uma imagem.";
    return res.status(400).json({ erro: mensagem });
  }

  return res.status(400).json({ erro: erro.message });
}

async function lerPedidos() {
  const conteudo = await fs.readFile(ARQUIVO_PEDIDOS, "utf8");
  return JSON.parse(conteudo);
}

async function salvarPedidos(pedidos) {
  await fs.writeFile(ARQUIVO_PEDIDOS, JSON.stringify(pedidos, null, 2), "utf8");
}

app.get("/api/pedidos", async (req, res) => {
  try {
    const pedidos = await lerPedidos();
    res.json(pedidos);
  } catch (erro) {
    console.error("Erro ao ler pedidos:", erro);
    res.status(500).json({ erro: "Não foi possível carregar os pedidos." });
  }
});

app.post(
  "/api/pedidos",
  upload.single("foto"),
  tratarErroUpload,
  async (req, res) => {
    let caminhoImagemSalvo;
    try {
      const { categoria, local, descricao } = req.body;

      if (!categoria || !local || !descricao) {
        return res.status(400).json({
          erro: "Categoria, bairro/cidade e descrição são obrigatórios.",
        });
      }

      let foto = "";
      if (req.file) {
        const extensao = detectarExtensaoImagem(req.file.buffer);
        if (!extensao) {
          return res.status(400).json({
            erro: "O arquivo enviado não é uma imagem JPG, PNG, WEBP ou GIF válida.",
          });
        }

        await fs.mkdir(DIRETORIO_UPLOADS, { recursive: true });
        const nomeArquivo = `${randomUUID()}.${extensao}`;
        caminhoImagemSalvo = path.join(DIRETORIO_UPLOADS, nomeArquivo);
        foto = `/uploads/${nomeArquivo}`;
        await fs.writeFile(caminhoImagemSalvo, req.file.buffer, { flag: "wx" });
      } else if (typeof req.body.foto === "string") {
        foto = req.body.foto;
      }

      const pedidos = await lerPedidos();

      const novoPedido = {
        id: randomUUID(),
        categoria,
        local,
        descricao,
        foto,
        criadoEm: new Date().toISOString(),
        orcamentos: [],
      };

      pedidos.push(novoPedido);
      await salvarPedidos(pedidos);

      res.status(201).json({
        mensagem: "Pedido cadastrado com sucesso.",
        pedido: novoPedido,
      });
    } catch (erro) {
      if (caminhoImagemSalvo) {
        try {
          await fs.unlink(caminhoImagemSalvo);
        } catch (erroLimpeza) {
          if (erroLimpeza.code !== "ENOENT") {
            console.error("Erro ao remover imagem não vinculada:", erroLimpeza);
          }
        }
      }
      console.error("Erro ao cadastrar pedido:", erro);
      res.status(500).json({ erro: "Não foi possível salvar o pedido." });
    }
  },
);

app.post("/api/pedidos/:id/orcamentos", async (req, res) => {
  try {
    const { profissional, valor, prazo } = req.body;

    if (!profissional || valor === undefined || valor === null || !prazo) {
      return res.status(400).json({
        erro: "Nome do profissional, valor e prazo são obrigatórios.",
      });
    }

    const valorNumerico = Number(valor);
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      return res
        .status(400)
        .json({ erro: "Informe um valor válido para o orçamento." });
    }

    const pedidos = await lerPedidos();
    const pedido = pedidos.find((item) => item.id === req.params.id);

    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado." });
    }

    const novoOrcamento = {
      id: randomUUID(),
      profissional,
      valor: valorNumerico,
      prazo,
      criadoEm: new Date().toISOString(),
    };

    pedido.orcamentos.push(novoOrcamento);
    await salvarPedidos(pedidos);

    res.status(201).json({
      mensagem: "Orçamento enviado com sucesso.",
      orcamento: novoOrcamento,
    });
  } catch (erro) {
    console.error("Erro ao salvar orçamento:", erro);
    res.status(500).json({ erro: "Não foi possível salvar o orçamento." });
  }
});

app.listen(PORT, () => {
  console.log(`OrçaVupt rodando em http://localhost:${PORT}`);
});
