FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY prisma ./prisma

COPY . .

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3333

CMD ["node", "dist/infra/main.js"]