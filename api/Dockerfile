FROM node:24-alpine

RUN apk add --no-cache libc6-compat

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --shamefully-hoist

COPY prisma ./prisma

RUN pnpm db:generate

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/server.js"]