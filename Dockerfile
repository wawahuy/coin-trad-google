FROM node:15.12.0-alpine3.13

ENV PORT=12000

WORKDIR /src/abc/coin

# cache node_modules
COPY ./server/package*.json ./
RUN npm install

COPY ./server .

COPY ./tool-coin ../tool-coin

RUN npm run build

RUN npm run build-resource

EXPOSE 12000

CMD "npm" "run" "prod"
