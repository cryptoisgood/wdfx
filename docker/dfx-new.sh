#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

dfx new "$@"
pwd=$(pwd)
mv  -v "$pwd/$1/"* "$pwd"
rm -rf "$pwd/$1/"
chown -R "${HOST_UID}:${HOST_UID}" .

