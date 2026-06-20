# Use the official Nginx image as the base
FROM nginx:alpine

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy your local frontend files into the Nginx container
COPY . /usr/share/nginx/html

# Copy your custom nginx.conf into the container's config directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard for Nginx inside the container)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]