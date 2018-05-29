#!/usr/bin/env bash

# TODO: This is a stub for now to get an Oni build to run on CI,
# but the plan is eventually to expose a CLI utility for getting
# a specific Oni version.

echo Travis build - detected OS is: "$TRAVIS_OS_NAME"
set -e

git clone https://github.com/onivim/oni.git .local-oni
cd .local-oni

echo Building Oni in: "$PWD"

yarn install
yarn check-cached-binaries
yarn build
yarn run pack --dir

ls -a dist
