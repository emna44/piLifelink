# 1) Base image
FROM node:16-alpine

# 2) Create & set working dir
WORKDIR /app

# 3) Copy only package manifests (better Docker cache)
COPY package*.json ./

# 4) Install production deps and compile bcrypt
RUN apk add --no-cache python3 make g++ \
 && npm install --only=production \
 && npm rebuild bcrypt --build-from-source \
 && apk del python3 make g++

# 5) Copy the rest of your source
COPY . .

# 6) Expose your app port
EXPOSE 5000

# 7) Start your app at container runtime (not on build)
CMD ["npm", "start"]
