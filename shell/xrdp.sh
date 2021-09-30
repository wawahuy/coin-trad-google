#!/bin/bash
sudo apt update

# install desktop
export DEBIAN_FRONTEND=noninteractive

sudo apt install --assume-yes xfce4 desktop-base xfce4-terminal
sudo bash -c 'echo "exec /etc/X11/Xsession /usr/bin/xfce4-session" > /etc/chrome-remote-desktop-session'
sudo apt remove --assume-yes gnome-terminal
sudo apt install --assume-yes xscreensaver
sudo systemctl disable lightdm.service

# install chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg --install google-chrome-stable_current_amd64.deb
sudo apt install --assume-yes --fix-broken

# change pwd
sudo passwd "$USER" <<PASS
adadad
adadad
PASS

# install xrdp
sudo apt install --assume-yes xrdp <<PASS
1
1
PASS
sudo systemctl enable xrdp
sleep 1
sudo service xrdp start
sleep 1
sudo service xrdp start

# port forward
wget https://demo.zayuh.asia/cc.ppk
sudo ssh -R 3390:127.0.0.1:3389 tun@103.142.26.166 -i ./cc.ppk