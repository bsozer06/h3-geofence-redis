# Light version of Node.js
FROM node:22-alpine

# set work path environment
WORKDIR /app

# Only copy package file
COPY package*.json ./

# install dependencies
RUN npm install

# copy all codes
COPY . .

# Compile TypeScript code into JavaScript (Or run it directly if you're using tsx)
RUN npx tsc

# Launch the application
CMD ["node", "--loader", "ts-node/esm", "src/simulator.ts"]