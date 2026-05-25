FROM node:22
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY ./ ./
RUN npm install
CMD node /usr/src/app/bin/www --watch
WORKDIR /