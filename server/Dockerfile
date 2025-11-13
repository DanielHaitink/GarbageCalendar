# Base image with Node
FROM node:24-alpine

# Set working directory inside container
WORKDIR /

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

RUN export NODE_ENV=production

# Install dependencies
RUN npm install --only=production

# Copy the rest of the code
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Default command (overridden by docker-compose.yml if needed)
CMD ["npm", "run", "start"]
