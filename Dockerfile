# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .


EXPOSE 8080/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
