FROM node:20-alpine

WORKDIR /app

RUN npm install express-session
RUN npm install -D @types/express-session

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
