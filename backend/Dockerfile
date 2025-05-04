FROM golang:1.23.7-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git build-base

# Copy only go.mod first to leverage caching
COPY go.mod ./
RUN go mod download && go mod verify

# Now copy the rest of the source code
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest

# Install MySQL and other required packages
RUN apk add --no-cache mysql mysql-client bash curl

WORKDIR /app

# Copy binary and env file from builder
COPY --from=builder /app/main .
COPY --from=builder /app/.env .

# Create startup script with proper error handling
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Initializing MySQL..."\n\
mysql_install_db --user=mysql --datadir=/var/lib/mysql\n\
mkdir -p /run/mysqld\n\
chown -R mysql:mysql /run/mysqld\n\
chown -R mysql:mysql /var/lib/mysql\n\
\n\
echo "Starting MySQL server..."\n\
/usr/bin/mysqld --user=mysql --datadir=/var/lib/mysql --console &\n\
\n\
echo "Waiting for MySQL to be ready..."\n\
for i in {1..30}; do\n\
    if mysqladmin ping -h "localhost" --silent; then\n\
        break\n\
    fi\n\
    echo "Waiting for MySQL to be ready... ($i/30)"\n\
    sleep 1\n\
done\n\
\n\
if ! mysqladmin ping -h "localhost" --silent; then\n\
    echo "MySQL failed to start"\n\
    exit 1\n\
fi\n\
\n\
echo "Configuring MySQL..."\n\
mysql -u root << EOF\n\
CREATE DATABASE IF NOT EXISTS procode;\n\
ALTER USER '"'"'root'"'"'@'"'"'localhost'"'"' IDENTIFIED BY '"'"'rootpass'"'"';\n\
GRANT ALL PRIVILEGES ON procode.* TO '"'"'root'"'"'@'"'"'localhost'"'"';\n\
FLUSH PRIVILEGES;\n\
EOF\n\
\n\
echo "Starting Go application..."\n\
exec ./main' > /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 8080 3306

ENV DB_USER=root \
    DB_PASSWORD=rootpass \
    DB_HOST=localhost \
    DB_PORT=3306 \
    DB_NAME=procode

CMD ["/app/start.sh"]
