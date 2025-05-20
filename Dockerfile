FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm run build

COPY dist ./dist

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/main"]
