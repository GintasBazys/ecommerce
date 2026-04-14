FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG STRIPE_PUBLIC_KEY
ARG NUXT_PUBLIC_STRIPE_PUBLIC_KEY
ENV STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY
ENV NUXT_PUBLIC_STRIPE_PUBLIC_KEY=$NUXT_PUBLIC_STRIPE_PUBLIC_KEY
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
