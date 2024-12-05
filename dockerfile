FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install --no-optional

COPY . .

RUN npm run build

# Stage de produção
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist .

EXPOSE 3000

CMD ["node", "dist/main.js"]