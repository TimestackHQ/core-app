FROM node:17

# Create app directory
WORKDIR /app

COPY ./ ./

USER root
RUN chmod -R 777 ./

RUN ls

RUN cd ./ApiService && npm i
RUN cd ./shared && npm i

CMD ["node", "./ApiService/index.js"]