#!/usr/bin/env bash

echo Travis build - detected OS is: "$TRAVIS_OS_NAME"
set -e

ovm install master
export ONI_EXECUTABLE_PATH="$(ovm path master)"

echo Oni executable path: $ONI_EXECUTABLE_PATH
