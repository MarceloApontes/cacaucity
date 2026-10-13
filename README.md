# Sobrevivência — Protótipo 001

Primeiro protótipo jogável de sobrevivência 3D com câmera alternável, criado com Vite e Three.js.

## Como executar

1. Instale Node.js LTS.
2. Abra esta pasta no VS Code.
3. No terminal, execute:

```bash
npm install
npm run dev
```

4. Abra o endereço local mostrado pelo Vite no navegador (normalmente http://localhost:5173).

## Controles

- WASD: movimentação
- Mouse: movimentar câmera (após clicar em **Entrar no mundo**)
- Shift: correr
- Espaço: pular
- V: alternar entre primeira e terceira pessoa
- Esc: liberar mouse

## Limitações do protótipo

- Mundo plano demonstrativo com árvores e pedras geradas por código.
- Colisões simples no solo com árvores e pedras; ainda não há colisão da câmera.
- Não há fome/sede dinâmicas, inventário, inimigos ou salvamento (serão fases futuras).
- Personagem geométrico provisório; não há modelos externos.
- Não há suporte a dispositivos móveis nesta etapa.

## Sincronização entre PCs

Crie um repositório GitHub e execute `git init`, `git add .`, `git commit -m "Protótipo 001"`, configure o remoto e envie. No notebook, faça o clone e execute `npm install`.
