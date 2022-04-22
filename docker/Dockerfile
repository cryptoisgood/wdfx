FROM ubuntu:22.04
MAINTAINER cryptoisgood
ENV NODE_VERSION=14
RUN apt-get update
RUN apt-get install curl build-essential cmake libdigest-sha-perl -y
RUN apt-get install libdigest-sha-perl -y
# DFX
RUN DFX_VERSION=0.9.3 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# rust
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        curl \
        git \
        rsync \
        ssh \
        libssl-dev \
        pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
 \
ENV RUST_BACKTRACE=full
ENV RUSTUP_HOME=/rust
ENV CARGO_HOME=/cargo
ENV PATH=/cargo/bin:/rust/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs >> rustup.sh
RUN sh rustup.sh -y
RUN rustup target add wasm32-unknown-unknown
# NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

WORKDIR /root/dfx
COPY deploy.sh deploy.sh
CMD tail -f /dev/null
SHELL ["/bin/bash", "-c"]