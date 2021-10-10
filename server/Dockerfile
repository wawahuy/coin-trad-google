FROM node:15.12.0-alpine3.13

ENV PORT=12000

WORKDIR /src/coin

# cache node_modules
COPY package*.json ./
RUN npm install

COPY . .

COPY ../tool-coin ../tool-coin

RUN npm run build

RUN npm run build-resource

EXPOSE 12000

CMD "npm" "run" "prod"
