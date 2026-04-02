# MEMORY.md

## Estado atual

- versao inicial: `v0.01.00`
- objetivo: MVP funcional antes de qualquer refinamento visual ou fisico
- deploy alvo: Railway
- dispositivo alvo adicional: iPhone via instalacao web

## Pontos importantes

- entrada esperada: arquivo CSV/TXT com `timestamp,x,y,z` e opcionalmente `vx,vy,vz`
- mock inicial em `data/mock-state-vectors.csv`
- parser central em `src/data/parser.js`
- fonte default em `src/data/source.js`
- renderer central em `src/ui/renderer.js`

## Limites aceitos nesta fase

- sem 3D
- sem dados ao vivo
- sem backend de ingestao
- sem dependencia de frameworks
