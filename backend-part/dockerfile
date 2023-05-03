FROM node:16

# Create app dir
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose express port
EXPOSE 3000

CMD ["node", "./bin/www"]
