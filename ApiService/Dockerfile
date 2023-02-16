FROM node:17

# Create app directory
WORKDIR /app

COPY ./.dist ./

RUN apt update -y
RUN apt install ffmpeg=5.1.2 -y

USER root
RUN chmod -R 777 ./

RUN ls

RUN cd ./ApiService && npm i
RUN cd ./shared && npm i

ENV NEW_RELIC_NO_CONFIG_FILE=true \
    NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true \
    NEW_RELIC_LOG=stdout \
    NEW_RELIC_LICENSE_KEY=ebf12d8c6ea7291fbd706958d971e88aFFFFNRAL \
    NEW_RELIC_APP_NAME="Timestack PROD"

CMD ["node", "./ApiService/index.js"]
