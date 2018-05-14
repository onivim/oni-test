#!/usr/bin/env bash

echo Travis build - detected OS is: "$TRAVIS_OS_NAME"
set -e

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  # Initialize display driver
  # This is needed for our unit tests (electron-mocha)
  # and integration tests
  DISPLAY=:99.0
  export DISPLAY
  sh -e /etc/init.d/xvfb start
  sleep 3

  # Install Neovim
  curl -LO https://github.com/neovim/neovim/releases/download/v0.2.2/nvim.appimage
  chmod u+x nvim.appimage
  ./nvim.appimage --version
  ONI_NEOVIM_PATH="$(cd "$(dirname "$1")"; pwd)/nvim.appimage"
  export ONI_NEOVIM_PATH
fi

npm run test
