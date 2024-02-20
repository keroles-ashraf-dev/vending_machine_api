# Vending machine api

## Usage:

> Postman collection available in root dir.<br/>

### With docker

1- copy .env file
```console
cp .env.example .env
```
2- build images and run containers
```console
docker-compose -f docker-compose.yml -f docker-compose-prod.yml up --build
```

### Without docker

1- copy .env file
```console
cp .env.example .env
```
2- install dependencies
```console
npm i
```
3- build
```console
npm run build
```
4- run
```console
npm run up-prod
```
