# syntax = docker/dockerfile:1
ARG NODE_VERSION=18.14.0
FROM node:${NODE_VERSION}-slim as base

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG CORS_ORIGIN
ENV CORS_ORIGIN=${CORS_ORIGIN}

ENV PORT=3000

LABEL fly_launch_runtime="nodejs"

WORKDIR /app

FROM base as build

RUN mkdir -p packages/client
RUN mkdir -p packages/server

COPY --link package.json package-lock.json ./
COPY --link packages/client/package.json packages/client
COPY --link packages/server/package.json packages/server
RUN npm ci

COPY --link . .

RUN npm -w @code-racer/app run db:generate

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000

ENV NODE_ENV=production

CMD [ "npm", "-w", "@scribbl/server", "run", "start" ]