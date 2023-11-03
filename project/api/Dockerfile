FROM jvberna/node:16

WORKDIR /usr/src/app
COPY code/package*.json ./

USER root
RUN npm install --location=global npm@9.6.7; npm audit fix 
USER node

COPY code/. ./

EXPOSE 5172
CMD [ "node", "server.js" ]
