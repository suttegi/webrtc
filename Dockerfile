FROM node:18

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

COPY .env .env

RUN npm run build

EXPOSE 3000
EXPOSE 3001


CMD ["npm", "start", "dev"]
