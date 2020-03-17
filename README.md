# File Storage Service

## Requirements

- `docker >= 19`
- `docker-compose >= v3`
- `python >= 3.7`


## Run Web UI

```
docker-compose build
docker-compose up -d
```
Now you can see awesome app in localhost:8080 🎉

If UI is stopped as loading, wait a minutes and try again.  
(Maybe application waiting database initialization)


## Use with CLI app.

__You must launch server following above instruction before use cli.__

```
./filestorage --help
```

## CLI details

### `list`

Get file list that stored in the storage.  
This command return max 100000 files.

```
./filestorage list --limit 100
```

will display

```
+------+---------------------+---------------------+
|   id | name                |          created_at |
+======+=====================+=====================+
| 1036 | /tmp/test/dummy_16  | 2020-02-16T19:14:58 |
+------+---------------------+---------------------+
| 1037 | /tmp/test/dummy_15  | 2020-02-16T19:14:58 |
+------+---------------------+---------------------+
```

__options__
- `raw`
  - Display result as row format
- `limit`
  - Max fetchable list size.
- `page`
  - If list size reached max limit, to setting `--page <next value>`, cli will fetch list from next offset to limit.

### `get`

Download file that specified by id.

```
./filestorage get --id <id> --outdir <Relative or absolute file path>
```

__options__

- `id` `required`
  - Specify file id
- `outdir` `optional`
  - Specify file output directory. This option will create directories if specified directories are not exists.

### `upload`

Upload a spcfified file.

```
./filestorage upload --file <Relative or absolute file path>
```

will display

```
+------+----------------+---------------+
|   id | name           |    created_at |
+======+================+===============+
| 1002 | filestorage.sh | 1581649426000 |
+------+----------------+---------------+
```


__options__

- `file` `required`
  - Path to a file.
- `raw`
  - Display result as row format

### `delete`

Delete a specified file.

```
./filestorage delete --id <id>
```

will display

```
+------+----------------+---------------+
|   id | name           |    created_at |
+======+================+===============+
| 1002 | filestorage.sh | 1581649426000 |
+------+----------------+---------------+
```


__options__

- `id` `required`
  - File id to delete.
- `row`
  - Display result as row format

## Development

__Additional requirements__

- Rust >= 1.41.0
- diesel_cli >= 1.4.0
- Node.JS >= 12.13.0
- Yarn >= 1.19.1
- cargo-make >= 0.27.0

### Server

__/api__

#### Install Requirements

```
cargo install cargo-make
cargo install diesel_cli
```

#### Build

```
cargo build --bin file_storage_server
```

#### Create/Update model for typescript

```
cargo build --bin typescriptify
./target/debug/typescriptify > ../web/src/domain/entities.ts
```

#### Run by hand

```
docker-compose up db

mkdir /tmp/fss_debug
RUST_LOG=debug STORAGE_PATH="/tmp/fss_debug" MYSQL_URL='mysql://user:password@127.0.0.1/file_storage' ./target/debug/file_storage_server
```

## Test

```
cargo make TEST
```

### UI

__/web__

#### Prepare

```
yarn install
```

#### Build

```
yarn build
```

#### Run development server

```
yarn debug
```

## Test

```
yarn test
```

### Assets

__/assets__

#### Prepare

```
yarn install
```

### Create icon font

1. Open `icons.ai`
2. Click `Save As`
3. Check `Use Artboards`
4. Select SVG format
5. Select `/assets/svg` directory.
6. Run `yarn build`

`icons` will created in `/web` directory.  
Web UI project references thease fonts without any additional work.

### CLI

__/cli__

All dependencies are stored in the desp directory.  
So if you add new dependencies, you need to run below command.

```
pip3 install <package> -t cli/deps
```

### Integration Test

#### Run all tests

```
docker-compose up -d
./integration/run_integration_test
```

#### Run CLI test

```
docker-compose up -d
./integration/run_cli_integration_test
```

#### Run UI test

```
docker-compose up -d
./integration/run_web_e2e_test
```

## Known problems

### Web UI work correctly but loading is not end.

Sometimes `app` container is not started after full build, so please restart all container by

```
docker-compose down
docker-compose up -d
```

### docker-compose build failed

Please recreate container.  
This services's container creations are relatively heavy process, so you can create each container separetely.

```
docker-compose build app
docker-compose build db
docker-compose build db-migration
docker-compose build web

docker-compose up -d
```

