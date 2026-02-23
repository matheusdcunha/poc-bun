# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## Comando para rodar fazer o build e rodar o container

Build
```sh
docker build -t meu-bun .
```

Run
```sh
docker run -p 8080:8080 --env-file ./.env meu-bun
```