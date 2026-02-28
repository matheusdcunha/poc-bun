# ==========================================
# Estágio 1: Builder
# Usamos a imagem oficial do Bun para compilar
# ==========================================
FROM oven/bun:1 AS builder

WORKDIR /app

# Otimizacao de cache: copia primeiro package e lockfile
# Isso impede que 'bun install' rode de novo se so o codigo mudou
COPY package.json bun.lock ./

# Instala as dependências (usando frozen-lockfile para garantir versões exatas)
RUN bun install --frozen-lockfile

# Copia o restante do código fonte
COPY . .

# Compila para um binario unico com o entrypoint correto da aplicacao.
RUN bun build ./src/http/server.ts --compile --outfile server

# ==========================================
# Estágio 2: Runner (Imagem Final)
# Usamos uma imagem muito leve, já que o binário não precisa do Bun instalado
# ==========================================
# Usamos debian:stable-slim para garantir compatibilidade com glibc
# Se quiser ser ainda mais radical, poderia tentar alpine (mas exige cuidados com musl/glibc)
FROM debian:stable-slim AS runner

WORKDIR /app

# Por segurança, não rodamos como root.
# Criamos um usuário 'bunuser' e grupo para rodar a aplicação.
RUN groupadd -r bunuser && useradd -r -g bunuser bunuser

# Copia APENAS o binário compilado no estágio anterior
COPY --from=builder --chown=bunuser:bunuser /app/server ./server

# Define o usuário que rodará o processo
USER bunuser

# Expõe a porta que sua aplicação usa (ajuste conforme necessário)
EXPOSE 3000

# Comando para iniciar o binário
ENTRYPOINT ["./server"]
