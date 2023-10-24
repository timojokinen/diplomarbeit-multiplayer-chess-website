#!/bin/bash

git config --global --add safe.directory /workspace
node -v > .nvmrc

nvm install
nvm use
nvm alias default $(node --version)
nvm install-latest-npm

npm i -g turbo

npm i