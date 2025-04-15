#----------------------------------------------
FROM node@sha256:9bef0ef1e268f60627da9ba7d7605e8831d5b56ad07487d24d1aa386336d1944 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile --no-audit --ignore-scripts
RUN npm rebuild bcrypt
COPY . .
RUN npm run build; \
  npm install --production --ignore-scripts --prefer-offline

#----------------------------------------------
FROM node@sha256:9bef0ef1e268f60627da9ba7d7605e8831d5b56ad07487d24d1aa386336d1944 AS production

RUN apk add --no-cache shadow && \
    addgroup -g 1001 jycuser && adduser -u 1001 -G jycuser -s /bin/sh -D jycuser

USER jycuser

ENV NODE_ENV=production
ENV APP_PORT=3000

WORKDIR /app

COPY --from=build --chown=jycuser:jycuser /app/package.json /app/package-lock.json ./
COPY --from=build --chown=jycuser:jycuser /app/node_modules ./node_modules
COPY --from=build --chown=jycuser:jycuser /app/dist ./dist

RUN npm ci --omit=dev

EXPOSE ${APP_PORT}

CMD ["node", "dist/main.js"]
