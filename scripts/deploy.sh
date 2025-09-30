#!/usr/bin/env bash
set -e
cd /home/simon/code/solid-deno
git pull origin main
systemctl --user restart app-stack
