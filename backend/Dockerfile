# Use official Bun image
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Run the application
CMD ["bun", "run", "start"]
