FROM rust:1.41 as build-deps

RUN apt-get -y update && mkdir -p /usr/local/bin;

WORKDIR /usr/local/build
RUN apt-get -y update && USER=root cargo new --bin file_storage_server
WORKDIR /usr/local/build/file_storage_server

COPY ./Cargo.toml ./
COPY ./Cargo.lock ./
RUN cargo build --release --bin dummy

COPY ./ ./
RUN cargo build --release --bin file_storage_server

FROM rust:1.41-slim

WORKDIR /usr/local/app

COPY --from=build-deps /usr/local/build/file_storage_server/target/release/file_storage_server .
COPY ./run.sh ./
RUN apt-get -y update && apt-get install -y default-libmysqlclient-dev default-mysql-client && rm -fr /usr/lib/mysqld*

CMD sh ./run.sh
