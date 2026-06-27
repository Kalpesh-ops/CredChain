default: build

all: test build

build:
	stellar contract build

test:
	cargo test

deploy:
	sh ../client/scripts/deploy.sh

fmt:
	cargo fmt --all

clean:
	cargo clean
