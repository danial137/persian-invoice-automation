# Prisma schema must be available when npm postinstall generates the client.
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm install

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 nextjs
COPY --chown=nextjs:nodejs --from=build /app/public ./public
COPY --chown=nextjs:nodejs --from=build /app/.next/standalone ./
COPY --chown=nextjs:nodejs --from=build /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
