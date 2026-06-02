# syntax=docker/dockerfile:1

###############################################################################
# Build stage — compile the React app with Vite.
###############################################################################
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci

COPY . .

# The API base URL is baked in at build time. docker-compose / CI passes it as
# a build arg; defaults to the compose backend address.
ARG VITE_API_BASE_URL=http://localhost:8000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build


###############################################################################
# Runtime stage — serve the static build with a tiny nginx image.
###############################################################################
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
