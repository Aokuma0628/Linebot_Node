# Dockerfile
FROM ruby:2.7-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
 && rm -rf /var/lib/apt/lists/*

RUN gem install ultrahook

CMD ["ultrahook"]
