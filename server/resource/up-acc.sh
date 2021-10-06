#!/bin/bash
cd ~/.config || exit
rm -rf data.zip
rm -rf google-chrome
google-chrome-stable --disable-dev-shm-usage

read -r -p "username:" uservar
read -r -p "password:" passvar
read -r -p "type (3 - worker, 2 - super):" typevar

zip -r data.zip google-chrome

curl \
  -i -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "user=${uservar}" \
  -F "pass=${passvar}" \
  -F "type=${typevar}" \
  -F "file=@data.zip" \
  !!__URL__!!common/new-account?token=EDPWph5bHMYsJ9aS