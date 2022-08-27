FROM node:16.17-alpine

ENV TZ=Europe/Paris 

RUN apk add --no-cache tzdata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /src/

COPY . ./

RUN npm install

RUN node deploy-commands.js

CMD ["node", "index.js"]