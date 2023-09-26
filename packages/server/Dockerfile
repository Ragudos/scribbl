# syntax = docker/dockerfile:1
FROM node:18.18.0-slim as base

ENV PORT=3000
ARG CORS_ORIGIN
ENV CORS_ORIGIN=${CORS_ORIGIN}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

LABEL fly_launch_runtime="nodejs"

COPY ./ ./

WORKDIR /

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --no-frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /node_modules /node_modules
COPY --from=build /dist /dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["pnpm", "start"]