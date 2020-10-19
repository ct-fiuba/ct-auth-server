TEST_CONTAINER_NAME=my-test-mongo

.PHONY: install
install:
	npm install;

.PHONY: run
run:
	docker-compose up --build;

.PHONY: test
test:
	docker run --rm -d -p 27017:27017 --name="$(TEST_CONTAINER_NAME)" mongo:3.6.4;
	(npm run test:integration test && docker stop $(TEST_CONTAINER_NAME)) || docker stop $(TEST_CONTAINER_NAME);


.PHONY: help
help:
	@echo 'Usage: make <target>'
	@echo ''
	@echo 'Available targets are:'
	@echo ''
	@grep -E '^\.PHONY: *' $(MAKEFILE_LIST) | cut -d' ' -f2- | sort
