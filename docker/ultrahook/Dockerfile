# Dockerfile
FROM ruby:2.7-slim

RUN apt-get update && \
    apt-get install -y && \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN gem install ultrahook

COPY .ultrahook /root/.ultrahook

CMD ["ultrahook", "devline", "3011"]
