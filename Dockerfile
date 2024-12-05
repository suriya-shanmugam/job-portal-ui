# Stage 1: Build the React application
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Set environment variables here
ENV REACT_APP_API_URL=http://localhost:5000/api/v1
ENV REACT_APP_API2_URL=http://localhost:5001/api/v1
ENV REACT_APP_VAPID_PUBLIC_KEY="BGWNHwBlYOAdOHlSx7HjEmRUAFcF7Wp4Vj2sl9z2ge9XElwPdiz9XTg81yF-s2Q2iO6fimv3TU4HS88J_oJNsbY"

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using nginx
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]