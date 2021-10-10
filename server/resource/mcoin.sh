#!/bin/bash
sudo apt update

# install desktop
export DEBIAN_FRONTEND=noninteractive

echo 'debconf debconf/frontend select Noninteractive' | sudo debconf-set-selections
sudo apt install -y -q keyboard-configuration
sudo apt install -y -q screen
sudo apt install --assume-yes xfce4 desktop-base xfce4-terminal
sudo bash -c 'echo "exec /etc/X11/Xsession /usr/bin/xfce4-session" > /etc/chrome-remote-desktop-session'
sudo apt remove --assume-yes gnome-terminal
sudo apt install --assume-yes xscreensaver
sudo systemctl disable lightdm.service

# install chrome
rm -rf google-chrome-stable_current_amd64.deb || true
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg --install google-chrome-stable_current_amd64.deb
sudo apt install --assume-yes --fix-broken

# run chrome
cd ~ || exit
rm -rf tool-coin || true
rm -rf tool-coin.zip || true
sudo apt install nodejs -y
wget !!__URL__!!resource/build/tool-coin.zip
unzip tool-coin.zip
echo "!!__ID__!!" > ~/tool-coin/.configid

cd ~/tool-coin || exit
npm i
npm run build
cd ~/tool-coin/node_modules/.bin || exit
chmod u+x ./*
cd ~/tool-coin/bin/linux || exit
chmod u+x ./*
cd ~/tool-coin || exit

sleep 2
screen -dm npm run prod
sleep 2