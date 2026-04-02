# CLAUDE.md

## Projeto

Visualizador 2D minimo da trajetoria estimada da Artemis II, com foco em simplicidade, deploy rapido e evolucao incremental.

## Convencoes

- versionamento SemVer com prefixo `vX.XX.XX`
- unidade de posicao em km
- unidade de velocidade em km/s
- timestamps em ISO 8601 UTC
- projecao inicial fixa em XY

## Decisoes atuais

- stack sem dependencias externas
- servidor Node minimo para servir estaticos localmente e no Railway
- app empacotada como PWA para instalacao via web no iPhone
- service worker sem cache offline agressivo para reduzir problemas de stale assets em deploy
- parser isolado em `src/data/parser.js`
- troca do dataset default isolada em `src/data/source.js`
- integracao oficial atual da NASA feita pelo endpoint local `/api/nasa/oem`, que consome o OEM publicado na pagina do Artemis II

## Proximos passos naturais

- substituir orbita lunar aproximada por efemerides reais da Lua
- suportar multiplas projecoes 2D
- adicionar zoom/pan
- adicionar validacoes de unidade e timezone no upload de arquivos
