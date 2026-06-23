FROM node:18-slim

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* /app/
RUN npm install

COPY frontend /app

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

