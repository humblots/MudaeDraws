FROM node:16.17-alpine

RUN apk add --update tzdata
ENV TZ=Europe/Paris 
# Clean APK cache
RUN rm -rf /var/cache/apk/*

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /src/

COPY . ./

RUN npm install

CMD ["node", "index.js"]