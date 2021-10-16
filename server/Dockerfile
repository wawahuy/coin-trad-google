FROM node:15.12.0-alpine3.13

ENV PORT=12000

WORKDIR /src/coin

RUN apk update
RUN apk add iproute2
RUN tc qdisc add dev eth0 handle 1: ingress
RUN tc filter add dev eth0 parent 1: protocol ip prio 50 u32 match ip src 0.0.0.0/0 police rate 4mbit burst 10k drop flowid :1
RUN tc qdisc add dev eth0 root tbf rate 4mbit latency 25ms burst 10k

# cache node_modules
COPY ./package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 12000

CMD "npm" "run" "prod"
