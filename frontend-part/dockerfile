FROM node:16-alpine
WORKDIR /app

# Copy the app files
COPY . .

# Install dependencies
RUN npm ci
# Build the app
RUN npm run build

# Set env to production
ENV NODE_ENV "production"
# Expose port
EXPOSE 3000

# Start the app
CMD ["npx", "serve", "build"]