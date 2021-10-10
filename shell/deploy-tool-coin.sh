#!/bin/bash

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