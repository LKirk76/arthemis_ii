# CLAUDE.md

## Projeto

Visualizador 2D minimo da trajetoria estimada da Artemis II, com foco em simplicidade, deploy rapido e evolucao incremental.

## Convencoes

- versionamento SemVer com prefixo `vX.XX.XX`
- unidade de posicao em km
- unidade de velocidade em km/s
- timestamps em ISO 8601 UTC
- projecao 2D no plano orbital derivado dos vetores 3D

## Decisoes atuais

- stack sem dependencias externas
- servidor Node minimo para servir estaticos localmente e no Railway
- app empacotada como PWA para instalacao via web no iPhone
- service worker sem cache offline agressivo para reduzir problemas de stale assets em deploy
- parser isolado em `src/data/parser.js`
- troca do dataset default isolada em `src/data/source.js`
- integracao oficial atual da NASA feita pelo endpoint local `/api/nasa/oem`, que consome o OEM publicado na pagina do Artemis II
- renderer com centralizacao alternavel em Terra, Lua ou capsula e controle de zoom

## Proximos passos naturais

- substituir orbita lunar aproximada por efemerides reais da Lua
- adicionar pan manual
- refinar a projecao para casos degenerados do plano orbital
- adicionar validacoes de unidade e timezone no upload de arquivos
