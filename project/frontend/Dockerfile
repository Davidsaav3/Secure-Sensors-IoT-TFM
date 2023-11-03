FROM jvberna/node:16 AS build-angular
WORKDIR /usr/src/app
COPY code/package*.json ./
RUN npm install
COPY code/. .
COPY files_deploy/environment.ts ./src/app/environments/environment.ts
RUN npm run build

FROM jvberna/nginx:1.23.0
COPY files_deploy/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-angular /usr/src/app/dist/sensors /usr/share/nginx/html