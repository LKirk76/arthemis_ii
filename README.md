# Artemis II Trajectory Viewer

MVP web e instalavel para visualizar em 2D a trajetoria estimada da Artemis II no plano XY.

## O que entrega

- Visualizacao 2D com Terra, Lua, trajetoria e posicao atual da nave
- Slider de tempo com `play/pause`
- Metricas de tempo de missao, distancia da Terra, distancia da Lua e velocidade quando presente
- Parser para `timestamp,x,y,z` com `vx,vy,vz` opcionais
- Mock inicial pronto para ser substituido por dados reais
- Integracao com dados oficiais da NASA via OEM publicado na pagina do Artemis II
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
- `server.js`: servidor estatico minimo e proxy do OEM oficial da NASA

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

## Fonte oficial da NASA

A aplicacao agora tenta carregar por padrao a ephemeris oficial da NASA para Artemis II.

Fluxo:

- `server.js` busca a pagina oficial do Artemis II em tempo real
- o servidor localiza o ZIP OEM publicado pela NASA
- o servidor extrai o `.asc` do ZIP e expoe os dados em `/api/nasa/oem`
- `src/data/source.js` consome esse endpoint e passa o texto para `parseNasaOemText()`

Fonte oficial usada hoje:

- pagina: `https://www.nasa.gov/missions/artemis/artemis-2/track-nasas-artemis-ii-mission-in-real-time/`

## Onde trocar a fonte de dados

- `src/data/source.js`

Hoje:

- `loadOfficialNasaDataset()` usa `/api/nasa/oem`
- `DEFAULT_DATA_PATH` continua apontando para `data/mock-state-vectors.csv` como fallback

Para trocar:

1. Se a NASA mudar o link publicado, ajuste a descoberta em `server.js`.
2. Se o formato bruto mudar, adapte `parseNasaOemText()` em `src/data/parser.js`.
3. Se quiser outra fonte, troque `loadOfficialNasaDataset()` em `src/data/source.js`.

## Limites conhecidos

- A projecao e apenas XY
- A Lua usa orbita circular aproximada para referencia visual e calculo de distancia
- Nao ha telemetria ao vivo
- Nao ha 3D
