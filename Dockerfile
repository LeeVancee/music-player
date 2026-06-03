ARG NODE_IMAGE=swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-bookworm-slim

FROM ${NODE_IMAGE} AS deps

WORKDIR /app

ARG PNPM_VERSION=10.8.1
ARG NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN npm config set registry ${NPM_CONFIG_REGISTRY} \
  && npm install --global pnpm@${PNPM_VERSION} \
  && pnpm config set registry ${NPM_CONFIG_REGISTRY}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY . .
RUN pnpm build

FROM ${NODE_IMAGE} AS runner

WORKDIR /app

ARG PNPM_VERSION=10.8.1
ARG NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN npm config set registry ${NPM_CONFIG_REGISTRY} \
  && npm install --global pnpm@${PNPM_VERSION} \
  && pnpm config set registry ${NPM_CONFIG_REGISTRY}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY drizzle.config.ts tsconfig.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY drizzle ./drizzle
COPY src/lib/db ./src/lib/db

EXPOSE 3000

CMD ["sh", "-c", "mkdir -p tracks covers && pnpm db:migrate && node .output/server/index.mjs"]
