# syntax = docker/dockerfile:1
FROM node:18.18.0-slim as base

ENV PORT=3000
ARG CORS_ORIGIN
ENV CORS_ORIGIN=${CORS_ORIGIN}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

LABEL fly_launch_runtime="nodejs"

COPY --link ./ ./app

WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build

FROM base AS shared-types
COPY --from=prod-deps /app/packages/shared-types/node_modules /app/packages/shared-types/node_modules
COPY --from=build /app/packages/shared-types /app/packages/shared-types

FROM shared-types AS server
COPY --from=prod-deps /app/packages/server/node_modules /app/packages/server/node_modules
COPY --from=build /app/packages/server/dist /app/packages/server/dist
WORKDIR /app/packages/server

EXPOSE 3000

ENV NODE_ENV=production

CMD ["pnpm", "start"]