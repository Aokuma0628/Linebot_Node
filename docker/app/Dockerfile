FROM node:18-slim

# OSセッティング
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoclean
ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /app

# ユーザ作成
RUN groupadd -r nodeuser && \
    useradd -r -g nodeuser nodeuser && \
    chown -R nodeuser:nodeuser /app
USER nodeuser

# NPMセッティング
COPY --chown=nodeuser:nodeuser package.json package-lock.json ./
RUN npm intall
# 本番用
# RUN npm ci --only=production
COPY --chown=nodeuser:nodeuser ./app .

# 本番運用時のコマンド
# RUN npm run build
# CMD ["npm", "start"]