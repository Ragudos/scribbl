# syntax = docker/dockerfile:1
ARG NODE_VERSION=18.14.0
FROM node:${NODE_VERSION}-slim as base

ARG CORS_ORIGIN
ENV CORS_ORIGIN=${CORS_ORIGIN}

ENV PORT=3000

LABEL fly_launch_runtime="nodejs"

FROM base as build

RUN mkdir -p packages/server

COPY --link package.json pnpm-lock.yaml ./
COPY --link packages/server/package.json packages/server
COPY --link packages/shared-types/package.json packages/shared-types
RUN npm ci

COPY --link . .

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000

ENV NODE_ENV=production

CMD [ "npm", "-w", "@scribbl/server", "run", "start" ]