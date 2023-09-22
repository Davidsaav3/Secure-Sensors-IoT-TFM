FROM node:10-alpine as build-step

RUN mkdir -p /app

WORkDIR /app

COPY package.json /app

#RUN npm install
RUN NODE_ENV=development npm i

COPY . /app/

RUN npm run build --prod
#docker build --no-cache -t mybuild:v1 .  

#Segunda etapa

FROM nginx:1.17.1-alpine

COPY --from=build-step /app/dist/sensors /usr/share/nginx/html