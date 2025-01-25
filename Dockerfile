#----------------------------------------------
  FROM node:lts-alpine AS build
  WORKDIR /app
  COPY package.json package-lock.json ./
  RUN npm install --frozen-lockfile --no-audit --ignore-scripts
  RUN npm rebuild bcrypt
  COPY . .
  RUN npm run build; \
      npm install --production --ignore-scripts --prefer-offline

#----------------------------------------------
  FROM node:lts-alpine AS production

  ENV NODE_ENV=production
  ENV APP_PORT=3000

  WORKDIR /app

  COPY --from=build /app/package.json /app/package-lock.json ./
  COPY --from=build /app/node_modules ./node_modules
  COPY --from=build /app/dist ./dist

  EXPOSE ${APP_PORT}

  CMD ["node", "dist/main.js"]
