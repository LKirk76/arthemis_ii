# Changelog

## v0.01.00 - 2026-04-02

- criacao do MVP web instalavel para visualizar a trajetoria 2D estimada da Artemis II
- renderer em canvas com Terra, Lua, trilha e posicao atual da nave
- controles com slider temporal e play/pause
- metricas de tempo de missao, distancia da Terra, distancia da Lua e velocidade
- parser para arquivos `timestamp,x,y,z` com `vx,vy,vz` opcionais
- dataset mock inicial e ponto explicito para substituicao por dados reais
- servidor Node minimo para execucao local e deploy no Railway
- manifest, service worker e layout responsivo para uso no iPhone
