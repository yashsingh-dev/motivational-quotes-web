# Stage 1: Build Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Set NODE_ENV to development during build to ensure devDependencies are installed
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for Vite)
RUN npm install

# Copy source code
COPY . .

# Build the frontend (outputs to /app/dist)
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the frontend build from the builder stage
COPY --from=builder /app/dist ./dist

# Copy backend source and server entry point
COPY backend ./backend
COPY server.cjs ./server.cjs

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port matches the default in server.cjs
EXPOSE 5000

# Start the unified server
CMD ["node", "server.cjs"]
