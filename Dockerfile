# Use the official Node.js runtime as the base image
FROM node:16 AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the Angular app for production
RUN npm run build

# Use a lightweight web server to serve the Angular app
FROM nginx:alpine

# Copy the built Angular app from the previous stage to the Nginx container
COPY --from=build /usr/src/app/dist/sensors /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]