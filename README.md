# Artemis II Trajectory Viewer

MVP web e instalavel para visualizar em 2D a trajetoria estimada da Artemis II no plano XY.

## O que entrega

- Visualizacao 2D com Terra, Lua, trajetoria e posicao atual da nave
- Slider de tempo com `play/pause`
- Metricas de tempo de missao, distancia da Terra, distancia da Lua e velocidade quando presente
- Parser para `timestamp,x,y,z` com `vx,vy,vz` opcionais
- Mock inicial pronto para ser substituido por dados reais
- PWA basica para instalar no iPhone via Safari
- Deploy simples no Railway

## Estrutura

- `index.html`: shell da aplicacao
- `styles.css`: layout responsivo e visual
- `src/app.js`: orquestracao, controles e estado
- `src/ui/renderer.js`: renderizacao 2D em canvas
- `src/ui/metrics.js`: calculo das metricas visiveis
- `src/data/parser.js`: parser do arquivo de state vectors
- `src/data/source.js`: carregamento do mock e ponto de troca para dados reais
- `data/mock-state-vectors.csv`: dataset inicial
- `server.js`: servidor estatico minimo para local e Railway

## Rodar localmente

Requisitos:

- Node.js 18+

Comandos:

```bash
npm start
```

Depois abra:

```text
http://localhost:3000
```

## Instalar no iPhone

1. Faça deploy no Railway.
2. Abra a URL no Safari do iPhone.
3. Toque em `Compartilhar`.
4. Toque em `Adicionar a Tela de Inicio`.

## Deploy no Railway

1. Suba este repositório para o GitHub.
2. No Railway, crie um novo projeto a partir do repositório.
3. O Railway vai detectar `package.json` e usar `npm start`.
4. Depois do deploy, use a URL publica do Railway.

## Formato do arquivo de entrada

CSV ou TXT com cabecalho:

```csv
timestamp,x,y,z,vx,vy,vz
2026-09-01T12:00:00Z,6678,0,0,0,10.93,0.08
```

Campos obrigatorios:

- `timestamp`
- `x`
- `y`
- `z`

Campos opcionais:

- `vx`
- `vy`
- `vz`

Unidade assumida neste MVP:

- posicao em km
- velocidade em km/s
- tempo em ISO 8601 UTC

## Onde trocar o mock por dados reais

Ponto principal:

- `src/data/source.js`

Hoje:

- `DEFAULT_DATA_PATH` aponta para `data/mock-state-vectors.csv`

Para trocar:

1. Substitua `data/mock-state-vectors.csv` por um arquivo real com o mesmo formato.
2. Ou altere `DEFAULT_DATA_PATH` para outro arquivo/endpoint estatico.
3. Se o formato bruto mudar, adapte apenas `parseStateVectorText()` em `src/data/parser.js`.

## Limites conhecidos

- A projecao e apenas XY
- A Lua usa orbita circular aproximada para referencia visual e calculo de distancia
- Nao ha telemetria ao vivo
- Nao ha 3D
