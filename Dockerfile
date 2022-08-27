FROM node:16.17-alpine

WORKDIR /src/

COPY . ./

RUN npm install

CMD ["node", "index.js"]