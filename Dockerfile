# Stage 1: Build React App
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests & install dependencies
COPY package*.json ./
RUN npm install

# Copy source code (includes .env file)
COPY . .

# Build argument (optional override from CLI/CI)
ARG VITE_APP_API_URL

# Parse VITE_APP_API_URL from build arg or .env file and export to environment before npm run build
RUN TARGET_URL="${VITE_APP_API_URL:-$(grep -v '^#' .env 2>/dev/null | grep VITE_APP_API_URL | cut -d '=' -f2- | tr -d '\r')}" && \
    export VITE_APP_API_URL="$TARGET_URL" && \
    echo "=============================================" && \
    echo "[BUILD LOG] Compiling React with VITE_APP_API_URL: '$VITE_APP_API_URL'" && \
    echo "=============================================" && \
    npm run build

# Stage 2: Serve static files using Nginx Alpine
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
