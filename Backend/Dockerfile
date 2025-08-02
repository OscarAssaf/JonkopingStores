# Use Node.js 
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copying project files
COPY . .

# port
EXPOSE 3002

# Starting backend
CMD ["node", "server.js"]
