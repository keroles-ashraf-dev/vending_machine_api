# Vending machine api

## Usage:

### With docker

1- build image
```console
docker build -t $(image_name) .
```
2- run container
```console
docker run --name $(container_name) -d -p 3000:3000 $(image_name)
```

### Without docker

1- install dependencies
```console
npm i
```
2- compile tsc
```console
npm run tsc
```
3- webpack build
```console
npm run build
```
4- run server
```console
npm run up
```