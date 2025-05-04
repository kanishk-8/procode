FROM golang:1.21 AS builder

WORKDIR /app

# Initialize a new module
RUN go mod init github.com/kanishk-8/procode

# Create necessary directories for packages
RUN mkdir -p db middleware routes

# Copy package files to their respective directories
COPY db/*.go ./db/
COPY middleware/*.go ./middleware/
COPY routes/*.go ./routes/
COPY main.go .
COPY .env .

# Add required dependencies
RUN go get github.com/gofiber/fiber/v2@v2.52.6 && \
    go get github.com/golang-jwt/jwt/v4@v4.5.2 && \
    go get github.com/go-sql-driver/mysql@v1.9.2 && \
    go get github.com/joho/godotenv@v1.5.1 && \
    go get golang.org/x/crypto@v0.16.0

# Download all dependencies
RUN go mod tidy

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM debian:bullseye-slim

# Install MySQL 8 client, timezone data and other dependencies
RUN apt-get update && \
    apt-get install -y wget lsb-release gnupg tzdata procps ca-certificates && \
    apt-get install -y mariadb-server && \
    rm -rf /var/lib/apt/lists/* && \
    ln -fs /usr/share/zoneinfo/Asia/Kolkata /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    # Install root certificates to fix TLS issues
    update-ca-certificates

WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/.env .

RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Initializing MariaDB directories..."\n\
mkdir -p /var/run/mysqld /var/lib/mysql\n\
chown -R mysql:mysql /var/run/mysqld /var/lib/mysql\n\
chmod 777 /var/run/mysqld\n\
\n\
if [ ! -d "/var/lib/mysql/mysql" ]; then\n\
    echo "Initializing MariaDB data directory..."\n\
    mysqld --initialize-insecure --user=mysql\n\
fi\n\
\n\
echo "Starting MariaDB server..."\n\
service mariadb start\n\
\n\
# Wait for MariaDB to be ready\n\
for i in {1..30}; do\n\
    if mariadb -e "SELECT 1" &>/dev/null; then\n\
        break\n\
    fi\n\
    echo "Waiting for MariaDB to be ready... ($i/30)"\n\
    sleep 1\n\
done\n\
\n\
echo "Configuring MariaDB..."\n\
mariadb -e "SET PASSWORD FOR '\''root'\''@'\''localhost'\'' = PASSWORD('\''rootpass'\'');\n\
CREATE DATABASE IF NOT EXISTS procode;\n\
FLUSH PRIVILEGES;"\n\
\n\
echo "Starting Go application..."\n\
./main\n\
' > /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 8080 3306

ENV DB_USER=root \
    DB_PASSWORD=rootpass \
    DB_HOST=localhost \
    DB_PORT=3306 \
    DB_NAME=procode \
    TZ=Asia/Kolkata

CMD ["/app/start.sh"]
