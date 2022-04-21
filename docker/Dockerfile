FROM ubuntu:22.04
MAINTAINER cryptoisgood

RUN apt-get update
RUN apt-get install curl build-essential cmake libdigest-sha-perl -y
RUN apt-get install libdigest-sha-perl -y
COPY install.sh install.sh
RUN sh install.sh

WORKDIR /root/dfx
CMD tail -f /dev/null