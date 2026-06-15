FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Try to install with legacy-peer-deps to avoid issues with old React versions
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
