FROM mcr.microsoft.com/devcontainers/typescript-node:20-bullseye

# Install additional tools
RUN apt-get update && apt-get install -y \
    postgresql-client \
    redis-tools \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g pnpm@latest

# Set up workspace
WORKDIR /workspace

# Expose ports
EXPOSE 3000 3001 5432

# Keep container running
CMD ["sleep", "infinity"]
