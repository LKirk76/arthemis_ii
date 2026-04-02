# Changelog

## v0.03.00 - 2026-04-02

- visualizacao agora reprojeta os vetores 3D no plano orbital estimado em vez de fixar em XY
- novos controles para centralizar a camera em Terra, Lua ou capsula
- novo controle de zoom para inspecao local da trajetoria
- renderer revisado para destacar melhor a trilha completa e o trecho percorrido no enquadramento escolhido

## v0.02.00 - 2026-04-02

- integracao com a ephemeris oficial da NASA para Artemis II via OEM publicado no site oficial
- endpoint local `/api/nasa/oem` para buscar o ZIP oficial, extrair o `.asc` e entregar dados utilizaveis ao frontend
- parser novo para formato CCSDS OEM da NASA
- carregamento padrao agora tenta usar dados oficiais e faz fallback para mock quando necessario
- botao para alternar explicitamente para a fonte oficial da NASA
- service worker simplificado para evitar cache agressivo e reduzir a necessidade de limpar cache manualmente
- trajetoria completa agora fica visivel desde o carregamento inicial, com destaque para o trecho percorrido

## v0.01.00 - 2026-04-02

- criacao do MVP web instalavel para visualizar a trajetoria 2D estimada da Artemis II
- renderer em canvas com Terra, Lua, trilha e posicao atual da nave
- controles com slider temporal e play/pause
- metricas de tempo de missao, distancia da Terra, distancia da Lua e velocidade
- parser para arquivos `timestamp,x,y,z` com `vx,vy,vz` opcionais
- dataset mock inicial e ponto explicito para substituicao por dados reais
- servidor Node minimo para execucao local e deploy no Railway
- manifest, service worker e layout responsivo para uso no iPhone
