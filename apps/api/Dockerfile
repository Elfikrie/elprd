FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
ENV NODE_ENV=production
USER node
EXPOSE 3001
CMD ["npm", "run", "start:api"]

