FROM node:16.17-alpine

WORKDIR /src/

COPY . ./

RUN npm install

RUN node deploy-commands.js

CMD ["node", "index.js"]