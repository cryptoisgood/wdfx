FROM ubuntu:22.04
MAINTAINER cryptoisgood
ENV NODE_VERSION=14
ENV PATH=/cargo/bin:/rust/bin:$PATH
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
ENV RUST_BACKTRACE=full
ENV RUSTUP_HOME=/rust
ENV CARGO_HOME=/cargo
ENV NVM_DIR=/root/.nvm
WORKDIR /root/dfx
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        libdigest-sha-perl \
        cmake \
        curl \
        git \
        rsync \
        ssh \
        libssl-dev \
        pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)" && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs >> rustup.sh && \
    sh rustup.sh -y && \
    rm -rf rustup.sh && \
    rustup target add wasm32-unknown-unknown && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION} && \
    . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION} && \
    . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}

COPY deploy.sh deploy.sh
COPY dfx-new.sh dfx-new.sh
COPY dfx-start.sh dfx-start.sh
CMD tail -f /dev/null
SHELL ["/bin/bash", "-c"]