# 1) Base image
FROM node:16-alpine

# 2) Create & set working dir
WORKDIR /app

# 3) Copy only package manifests first (for better cache)
COPY package*.json ./

# 4) Install (and compile native modules) but only for production:
#    * --only=production to skip devDependencies like nodemon
#    * rebuild bcrypt from source so it’s correct for Alpine
RUN apk add --no-cache python3 make g++ \
 && npm install --only=production \
 && npm rebuild bcrypt --build-from-source \
 && apk del python3 make g++

# 5) Copy the rest of your application
COPY . .

# 6) Expose the port
EXPOSE 5000

# 7) Define the runtime command (not at build time!)
CMD ["npm", "start"]
