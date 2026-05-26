# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json ./
RUN npm install --omit=optional --no-audit --no-fund

# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache tini \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001
ENV NODE_ENV=production
ENV PORT=3010
ENV HOSTNAME=0.0.0.0
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3010
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","server.js"]
