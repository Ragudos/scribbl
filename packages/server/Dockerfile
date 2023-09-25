# syntax = docker/dockerfile:1
ARG NODE_VERSION=18.14.0
FROM node:${NODE_VERSION}-slim as base

ENV PORT=3000

LABEL fly_launch_runtime="nodejs"

WORKDIR /

RUN mkdir -p packages/server
RUN mkdir -p packages/shared-types

COPY --link ./package.json ./
COPY --link ./packages/server/package.json packages/server/
COPY --link ./packages/shared-types/package.json packages/shared-types/

RUN npm install

COPY --link ./ ./

WORKDIR /packages/server/

RUN npm install

WORKDIR /packages/shared-types

RUN npm install

WORKDIR /

FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

EXPOSE 3000

ENV NODE_ENV=production


CMD ["npm", "-w", "@scribbl/server", "run", "start"]