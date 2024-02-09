# base
FROM node:16 as base
WORKDIR /app
COPY package*.json ./

# development
FROM base as dev
RUN npm install
COPY . .
ENV PORT=3000
EXPOSE $PORT
CMD [ "npm", "run", "up-dev" ]

# production build
FROM base as prod_build
RUN npm install
COPY . .
RUN npm run build

# production
FROM base as prod
RUN npm install --only=production
COPY --from=prod_build app/dist/ ./dist
ENV PORT=3000
EXPOSE $PORT
CMD [ "npm", "run", "up-prod" ]
