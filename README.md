# Google Cloud Translation LLM + NMT

Google Cloud asosida qurilgan ikki panelli tarjimon web ilova. Ilova `English (en)`, `Russian (ru)`, va `Uzbek (uz)` tillari orasida tarjima qiladi va foydalanuvchiga ikkita modeldan birini tanlash imkonini beradi:

- `LLM`: Google Cloud `Translation LLM`
- `NMT`: Google Cloud `Cloud Translation Neural Machine Translation`

Frontend `Vite + React`, backend esa `Express + TypeScript` bilan yozilgan. Google Cloud chaqiruvlari faqat server tomonda bajariladi, shu sabab browser ichiga hech qanday Google credential chiqmaydi.

## Features

- `en`, `ru`, `uz` tillari orasida ikki yo‘nalishli tarjima
- `LLM` va `NMT` model tanlovi
- `translate.google.com` uslubidagi ikki panel interfeys
- tilni almashtirish uchun swap icon
- `Translate`, `Copy result`, `Clear` amallari
- uzun matnlar uchun backend chunking
- request validation va xatolarni normalizatsiya qilish
- lokal development uchun ADC
- production uchun server-side service account credential ulash imkoniyati

## Stack

- Frontend: `React`, `Vite`, `TypeScript`
- Backend: `Express`, `TypeScript`, `zod`
- Google Cloud SDK: `@google-cloud/translate`
- Testlar: `Vitest`, `Testing Library`

## Project Structure

```text
.
├── client/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts
│   │   ├── lib/
│   │   ├── services/
│   │   └── translators/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── package.json
└── README.md
```

## Requirements

Lokal development uchun:

- `Node.js 20+` yoki `Node.js 22+`
- `npm 10+`
- `gcloud CLI`
- Google Cloud project
- Cloud Translation API va Vertex AI yoqilgan hisob

Production server uchun qo‘shimcha:

- Ubuntu server yoki shunga o‘xshash Linux server
- `nginx`
- `systemd`
- SSL uchun `certbot`
- GitHub’dan repository clone qilish imkoniyati

## 1. Google Cloud Setup

Bu bo‘limni diqqat bilan bajaring. Loyiha ishlashi uchun aynan shu qadamlar kerak.

### 1.1. Google Cloud project yarating yoki mavjud projectni tanlang

Google Cloud Console’da yangi project yarating yoki mavjud projectni tanlang.

Sizga kerak bo‘ladigan eng muhim qiymat:

- `Project ID`

Masalan:

```text
my-translation-project
```

`Project name` va `Project ID` bir xil bo‘lishi shart emas. Kodingizda aynan `Project ID` ishlatiladi.

### 1.2. Billing yoqilganini tekshiring

Cloud Translation va Vertex AI odatda billing talab qiladi. Billing yoqilmagan bo‘lsa, API chaqiruvlari ishlamasligi mumkin.

Tekshirish:

- Google Cloud Console
- `Billing`
- project billing account bilan ulangan bo‘lishi kerak

### 1.3. Kerakli API’larni yoqing

Quyidagi API’lar kerak:

- `Cloud Translation API`
- `Vertex AI API`

CLI orqali yoqish:

```bash
gcloud services enable translate.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### 1.4. Kerakli IAM ruxsatlarini tayyorlang

Lokal development uchun sizning user hisobingiz yoki production service account quyidagi xizmatlardan foydalana olishi kerak:

- Cloud Translation
- Vertex AI translation yo‘li

Eng amaliy yo‘l:

- development uchun project owner/editor bilan sinash
- production uchun alohida service account yaratish

## 2. Local Development Setup

### 2.1. Repository’ni clone qiling

```bash
git clone https://github.com/devtulkin/google-cloud-translation-llm-nmt.git
cd google-cloud-translation-llm-nmt
```

### 2.2. Dependency’larni o‘rnating

```bash
npm install
```

### 2.3. gcloud CLI o‘rnating

Avval `gcloud` mavjudligini tekshiring:

```bash
gcloud version
```

Yo‘q bo‘lsa, Google Cloud CLI’ni o‘rnating:

- macOS: Homebrew yoki rasmiy installer
- Ubuntu: Google Cloud SDK repository orqali

Rasmiy yo‘riqnoma:

- [Install gcloud CLI](https://cloud.google.com/sdk/docs/install)

### 2.4. gcloud login qiling

Bu `gcloud` CLI uchun login:

```bash
gcloud auth login
```

Bu buyruq brauzer oynasini ochadi. Google account bilan kirasiz va ruxsat berasiz.

Tekshirish:

```bash
gcloud auth list
```

### 2.5. Active project ni tanlang

```bash
gcloud config set project YOUR_PROJECT_ID
```

Misol:

```bash
gcloud config set project my-translation-project
```

Tekshirish:

```bash
gcloud config list
```

### 2.6. Application Default Credentials (ADC) ni sozlang

Lokal development uchun loyiha `ADC` ishlatadi.

```bash
gcloud auth application-default login
```

Bu ham brauzer ochadi. Auth tugagach, local credential fayl yaratiladi.

Tekshirish:

```bash
gcloud auth application-default print-access-token
```

Agar token chiqsa, ADC ishlayapti.

### 2.7. Environment fayllarni yarating

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

#### `server/.env`

```env
PORT=8787
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=global
MAX_TRANSLATION_CHARS=12000
CHUNK_SIZE_CHARS=3000
```

#### `client/.env`

```env
VITE_API_BASE_URL=/api
```

### 2.8. Lokal development serverni ishga tushiring

```bash
npm run dev
```

Ochiladigan adreslar:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`
- Health endpoint: `http://localhost:8787/api/health`

### 2.9. Health check

```bash
curl http://localhost:8787/api/health
```

Kutilgan javob:

```json
{"status":"ok"}
```

### 2.10. Lokal production build test

```bash
npm test
npm run build
```

## 3. How Google Credentials Work In This Project

Loyiha browser’dan Google Cloud’ga to‘g‘ridan-to‘g‘ri ulanmaydi.

Flow:

1. Browser backend’ga `/api/translate` request yuboradi
2. Backend requestni validatsiya qiladi
3. Backend tanlangan modelga qarab:
   - `NMT`
   - `LLM`
   adapteriga yuboradi
4. Google Cloud translation javobi backend orqali frontend’ga qaytadi

Shu sabab:

- browser’ga Google credential chiqmaydi
- production’da faqat backend credential biladi

## 4. Common Local Problems

### 4.1. `GOOGLE_CLOUD_PROJECT is required`

Sabab:

- `server/.env` ichida `GOOGLE_CLOUD_PROJECT` yo‘q

Yechim:

- `server/.env` ga to‘g‘ri project ID yozing

### 4.2. Authentication xatolari

Sabab:

- `gcloud auth application-default login` qilinmagan
- noto‘g‘ri account bilan login qilingan

Yechim:

```bash
gcloud auth application-default revoke
gcloud auth application-default login
```

### 4.3. API disabled xatosi

Sabab:

- `translate.googleapis.com` yoki `aiplatform.googleapis.com` yoqilmagan

Yechim:

```bash
gcloud services enable translate.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### 4.4. Permission denied

Sabab:

- user account yoki service account kerakli ruxsatga ega emas

Yechim:

- IAM ichida translation va vertex access ni tekshiring

## 5. Production Deployment Overview

Tavsiya etilgan production arxitektura:

- `DigitalOcean Droplet`
- `Nginx` reverse proxy
- `systemd` orqali Node backend service
- frontend `client/dist` statik fayllar sifatida
- backend `server/dist/index.js`
- `Let’s Encrypt` orqali SSL
- Google Cloud service account JSON server ichida saqlanadi

## 6. Production Deployment On A Server

Quyidagi qadamlar Ubuntu server uchun yozilgan.

### 6.1. Serverga ulaning

```bash
ssh root@YOUR_SERVER_IP
```

Yoki boshqa sudo user bilan:

```bash
ssh your-user@YOUR_SERVER_IP
```

### 6.2. Server paketlarini yangilang

```bash
sudo apt update
sudo apt upgrade -y
```

### 6.3. Nginx, Node.js, Git ni o‘rnating

```bash
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Tekshirish:

```bash
node -v
npm -v
nginx -v
```

### 6.4. Application papkasini tayyorlang

```bash
sudo mkdir -p /var/www/google-cloud-translation-llm-nmt
sudo chown -R $USER:$USER /var/www/google-cloud-translation-llm-nmt
cd /var/www/google-cloud-translation-llm-nmt
```

### 6.5. Repository’ni clone qiling

```bash
git clone https://github.com/devtulkin/google-cloud-translation-llm-nmt.git .
```

### 6.6. Production dependency va build

```bash
npm install
npm run build
```

## 7. Google Cloud Production Credential Setup

Production server uchun `gcloud auth application-default login` ishlatish tavsiya etilmaydi. Eng amaliy yo‘l:

- alohida `service account` yarating
- faqat kerakli ruxsat bering
- JSON key yarating
- serverga xavfsiz joyga joylashtiring

### 7.1. Service account yarating

Google Cloud Console ichida:

- `IAM & Admin`
- `Service Accounts`
- `Create Service Account`

Masalan nom:

```text
translation-runtime
```

### 7.2. Kerakli ruxsatlarni bering

Amalda project va API konfiguratsiyasiga qarab ruxsatlar o‘zgarishi mumkin, lekin translation chaqiruvlari uchun translation va vertex access kerak bo‘ladi.

Kamida:

- translation ishlatish huquqi
- vertex translation yo‘li uchun access

Production’da minimal privilege printsipi bilan boring.

### 7.3. JSON key yarating

Service account ichida:

- `Keys`
- `Add key`
- `Create new key`
- `JSON`

JSON faylni yuklab oling.

### 7.4. JSON faylni serverga joylang

```bash
sudo mkdir -p /opt/google-cloud-translation-llm-nmt/secrets
sudo nano /opt/google-cloud-translation-llm-nmt/secrets/gcp-service-account.json
sudo chmod 600 /opt/google-cloud-translation-llm-nmt/secrets/gcp-service-account.json
```

Yuklab olingan JSON ichidagini shu faylga joylashtiring.

## 8. Production Environment Variables

Serverda env fayl yarating:

```bash
sudo nano /etc/google-cloud-translation-llm-nmt.env
```

Ichiga:

```env
PORT=8787
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=global
MAX_TRANSLATION_CHARS=12000
CHUNK_SIZE_CHARS=3000
GOOGLE_APPLICATION_CREDENTIALS=/opt/google-cloud-translation-llm-nmt/secrets/gcp-service-account.json
```

Izoh:

- `GOOGLE_APPLICATION_CREDENTIALS` production server uchun juda muhim
- aynan service account JSON yo‘lini ko‘rsatadi

## 9. systemd Service Setup

`systemd` backend’ni doimiy ishlatib turadi va server restart bo‘lsa qayta ko‘taradi.

```bash
sudo nano /etc/systemd/system/google-cloud-translation-llm-nmt.service
```

Ichiga:

```ini
[Unit]
Description=Google Cloud Translation LLM + NMT backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/google-cloud-translation-llm-nmt/server
EnvironmentFile=/etc/google-cloud-translation-llm-nmt.env
ExecStart=/usr/bin/node /var/www/google-cloud-translation-llm-nmt/server/dist/index.js
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

File ownership:

```bash
sudo chown -R www-data:www-data /var/www/google-cloud-translation-llm-nmt
```

Service’ni ishga tushiring:

```bash
sudo systemctl daemon-reload
sudo systemctl enable google-cloud-translation-llm-nmt
sudo systemctl start google-cloud-translation-llm-nmt
sudo systemctl status google-cloud-translation-llm-nmt
```

Log ko‘rish:

```bash
journalctl -u google-cloud-translation-llm-nmt -f
```

## 10. Nginx Reverse Proxy Setup

Frontend statik build’ni serve qiladi va `/api` requestlarni backend’ga uzatadi.

```bash
sudo nano /etc/nginx/sites-available/app.example.com
```

Ichiga:

```nginx
server {
    listen 80;
    server_name app.example.com;

    root /var/www/google-cloud-translation-llm-nmt/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8787/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktiv qiling:

```bash
sudo ln -s /etc/nginx/sites-available/app.example.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 11. DNS Setup For Your Domain

DigitalOcean DNS ichida:

- Type: `A`
- Hostname: subdomain yoki root domain
- Value: server IP

Tekshirish:

```bash
dig app.example.com +short
```

Natijada sizning server IP chiqishi kerak.

## 12. SSL Setup With Let’s Encrypt

`certbot` o‘rnating:

```bash
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

SSL certificate oling:

```bash
sudo certbot --nginx -d app.example.com
```

Renew test:

```bash
sudo certbot renew --dry-run
```

## 13. Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 14. Deploy / Update Workflow

Kod yangilanganda:

```bash
cd /var/www/google-cloud-translation-llm-nmt
git pull
npm install
npm run build
sudo systemctl restart google-cloud-translation-llm-nmt
sudo systemctl reload nginx
```

## 15. Production Health Checks

Backend:

```bash
curl http://127.0.0.1:8787/api/health
```

Public HTTP:

```bash
curl -I http://app.example.com
```

Public HTTPS:

```bash
curl -I https://app.example.com
```

## 16. Security Notes

- `server/.env` va production env fayllarni Git ichiga qo‘ymang
- service account JSON faylni repository ichiga saqlamang
- `GOOGLE_APPLICATION_CREDENTIALS` production’da faqat serverdagi xavfsiz joyga pointing qilsin
- `chmod 600` ishlating
- production’da kerak bo‘lmagan ochiq portlarni yopiq saqlang

## 17. Useful Commands

### Local

```bash
npm install
npm run dev
npm test
npm run build
```

### Production service

```bash
sudo systemctl status google-cloud-translation-llm-nmt
sudo systemctl restart google-cloud-translation-llm-nmt
journalctl -u google-cloud-translation-llm-nmt -f
```

### Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx
```

## 18. API Summary

### `GET /api/health`

Response:

```json
{"status":"ok"}
```

### `POST /api/translate`

Request:

```json
{
  "text": "Hello world",
  "sourceLanguage": "en",
  "targetLanguage": "uz",
  "model": "llm"
}
```

Response:

```json
{
  "translatedText": "Salom dunyo",
  "sourceLanguage": "en",
  "targetLanguage": "uz",
  "model": "llm",
  "chunks": 1,
  "latencyMs": 210
}
```

## 19. Important Notes About LLM vs NMT

- `NMT` odatda tezroq ishlaydi
- `LLM` ayrim holatlarda tabiiyroq tarjima berishi mumkin
- ikkala model ham backend orqali boshqariladi
- frontend faqat model tanlovini yuboradi

## 20. Recommended First-Time Checklist

Agar birinchi marta o‘rnatayotgan bo‘lsangiz, shu ketma-ketlik bo‘yicha boring:

1. Google Cloud project tayyorlang
2. Billing yoqing
3. `translate.googleapis.com` va `aiplatform.googleapis.com` ni yoqing
4. Repo’ni clone qiling
5. `npm install`
6. `gcloud auth login`
7. `gcloud config set project YOUR_PROJECT_ID`
8. `gcloud auth application-default login`
9. `cp server/.env.example server/.env`
10. `server/.env` ichiga `GOOGLE_CLOUD_PROJECT` yozing
11. `npm run dev`
12. browser’da tekshiring
13. `npm test`
14. `npm run build`
15. production server bo‘lsa `service account`, `systemd`, `nginx`, `ssl`, `dns` qadamlarini bajaring

## References

- [Google Cloud Translation](https://cloud.google.com/translate)
- [Vertex AI Translation](https://cloud.google.com/vertex-ai/generative-ai/docs/translate/translate-text)
- [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)
- [DigitalOcean DNS](https://docs.digitalocean.com/products/networking/dns/)
- [Certbot](https://certbot.eff.org/)
