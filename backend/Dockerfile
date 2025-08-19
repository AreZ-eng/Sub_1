# Gunakan image Node.js resmi
FROM node:20.17.0

# Direktori kerja dalam kontainer
WORKDIR /app_sub_api

# Salin file aplikasi
COPY package*.json ./
RUN npm install

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client nano && \
    rm -rf /var/lib/apt/lists/* 

# Salin file aplikasi ke dalam kontainer
COPY . .

# Salin sertifikat SSL
COPY certs/server.key /etc/ssl/private/server.key
COPY certs/server.crt /etc/ssl/private/server.crt

# RUN chmod 600 /etc/ssl/server.key
# RUN chmod 644 /etc/ssl/certs/server.crt

# Ekspos port
EXPOSE 7000

# Jalankan aplikasi
CMD ["node", "server.js"]
