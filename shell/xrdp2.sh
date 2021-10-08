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
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg --install google-chrome-stable_current_amd64.deb
sudo apt install --assume-yes --fix-broken

# run chrome
cd ~
rm -rf test || true
sudo apt install git -y
git clone https://wawahuy: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@github.com/wawahuy/coin-trad-google.git
mv coin-trad-google test
sudo apt install nodejs -y
cd ~/test/tool-coin
npm i
npm run build
cd ~/test/tool-coin/node_modules/.bin
chmod u+x *
cd ~/test/tool-coin/bin/linux
chmod u+x *
cd ~/test/tool-coin
npm run prod
screen -dm npm run prod