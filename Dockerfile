FROM node:20-slim

# Install python and build-essential for better-sqlite3 compilation if needed
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Environment setup
ENV PORT=3000
ENV NODE_ENV=production
# Force the app to save the SQLite database inside the persistent volume folder
ENV USER_DATA_PATH=/data

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
