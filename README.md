# Reformei — deploy na Railway

Site estático servido pelo Caddy. Estrutura da pasta:

```
index.html     → o app (renomeie o reformei.html para index.html)
precos.json    → livro de preços editável (o app lê no carregamento)
Dockerfile     → build da Railway
Caddyfile      → config do servidor
```

## Subir na Railway

### Opção 1 — GitHub (recomendado)
1. Crie um repositório e coloque os 4 arquivos na raiz.
2. Railway → New Project → **Deploy from GitHub repo** → escolha o repo.
3. A Railway detecta o `Dockerfile` e faz o build sozinha.
4. Em **Settings → Networking → Generate Domain** para ganhar `xxxx.up.railway.app`.
5. (Opcional) **Custom Domain** → aponte `reformei.com.br` (CNAME que a Railway mostrar).

### Opção 2 — CLI
```
npm i -g @railway/cli
railway login
railway init          # cria o projeto
railway up            # faz deploy da pasta atual
railway domain        # gera o domínio público
```

## Atualizar preços sem mexer no código
Edite só o `precos.json`:

```json
{
  "atualizadoEm": "outubro de 2026",
  "reajuste": 1.08,
  "overrides": { "cimento cp2 50kg": "R$ 42–48" }
}
```

- `reajuste`: multiplicador global (1.08 = +8%).
- `overrides`: preço item a item, pela chave de busca do produto.

Faça commit/deploy de novo (ou `railway up`) e o app pega os novos preços no próximo carregamento.

## Editar os afiliados
No `index.html`, no topo do `<script>`, a constante `AFFILIATE`:
- Amazon já está: `params: "&tag=reformei04-20"`.
- Shopee e Mercado Livre: cole o sufixo do link gerado no painel de cada programa.
