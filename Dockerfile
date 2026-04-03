# ---------------------------
# Stage 1: Build
# ---------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# ---------------------------
# Stage 2: Production
# ---------------------------
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only necessary files
COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Environment
ENV NODE_ENV=production

# Port
EXPOSE 5000

# Start app
CMD ["npm", "start"]