FROM node:22.15.1 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN chmod -R u+x node_modules/.bin/
RUN npm run build