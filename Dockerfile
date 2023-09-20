FROM node:18

RUN apt-get update && \
        apt-get install -y nano git python3 make g++ libcairo2-dev libpango1.0-dev

RUN npm install -g pm2
