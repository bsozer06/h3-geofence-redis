# Node.js'in hafif bir sürümünü kullanıyoruz
FROM node:22-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Sadece package dosyalarını kopyala (katmanlı yapı için)
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm kodu kopyala
COPY . .

# TypeScript kodunu JavaScript'e derle (Veya tsx kullanıyorsan direkt çalıştır)
RUN npx tsc

# Uygulamayı başlat
CMD ["node", "--loader", "ts-node/esm", "src/simulator.ts"]