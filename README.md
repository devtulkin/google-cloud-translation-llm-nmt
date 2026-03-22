# Google Cloud Translation LLM + NMT

A production-ready web translator built with Google Cloud Translation APIs. The app provides a familiar two-panel translation interface and lets users switch between:

- `LLM`: Google Cloud `Translation LLM`
- `NMT`: Google Cloud `Cloud Translation Neural Machine Translation`

It currently supports translation between:

- `English (en)`
- `Russian (ru)`
- `Uzbek (uz)`

The frontend is built with `Vite + React`, and the backend is built with `Express + TypeScript`. All Google Cloud requests are made server-side so credentials are never exposed to the browser.

## Features

- Translate between `en`, `ru`, and `uz`
- Switch between `LLM` and `NMT`
- Two-panel translator UI inspired by familiar online translation tools
- Language swap control
- `Translate`, `Copy result`, and `Clear` actions
- Long-text chunking on the backend
- Request validation and normalized API errors
- Local development with Google ADC
- Production deployment support with service account credentials

## Tech Stack

- Frontend: `React`, `Vite`, `TypeScript`
- Backend: `Express`, `TypeScript`, `zod`
- Google SDK: `@google-cloud/translate`
- Testing: `Vitest`, `Testing Library`

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

For local development:

- `Node.js 20+` or `Node.js 22+`
- `npm 10+`
- `gcloud CLI`
- A Google Cloud project
- `Cloud Translation API` enabled
- `Vertex AI API` enabled

For production deployment:

- A Linux server such as Ubuntu
- `nginx`
- `systemd`
- SSL support through `certbot`
- Access to a Git host such as GitHub

## Quick Start

This is the fastest way to get the project running locally.

### 1. Clone the repository

```bash
git clone https://github.com/devtulkin/google-cloud-translation-llm-nmt.git
cd google-cloud-translation-llm-nmt
```

### 2. Install dependencies

```bash
npm install
```

### 3. Log in to Google Cloud

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth application-default login
```

### 4. Create environment files

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env`:

```env
PORT=8787
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=global
MAX_TRANSLATION_CHARS=12000
CHUNK_SIZE_CHARS=3000
```

### 5. Start the app

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:8787/api/health`

### 6. Run tests and build

```bash
npm test
npm run build
```

## Google Cloud Setup

This project depends on Google Cloud Translation and Vertex AI translation capabilities. The steps below are required for both local development and production.

### 1. Create or select a Google Cloud project

You need the project's `Project ID`, not just its display name.

Example:

```text
my-translation-project
```

### 2. Enable billing

Cloud Translation and Vertex AI usually require billing to be enabled. If billing is disabled, requests may fail even if your code is correct.

### 3. Enable the required APIs

```bash
gcloud services enable translate.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

Required APIs:

- `Cloud Translation API`
- `Vertex AI API`

### 4. Make sure the caller has permission

For local development, your Google user account must have access to the project and enabled APIs.

For production, your service account must have permission to call the translation services used by the app.

### 5. Install the gcloud CLI

If needed, install it from the official docs:

- [Install the gcloud CLI](https://cloud.google.com/sdk/docs/install)

Check your installation:

```bash
gcloud version
```

## Local Development Guide

### Authenticate with Google Cloud

Log in to the CLI:

```bash
gcloud auth login
```

Check the authenticated account:

```bash
gcloud auth list
```

Set the active project:

```bash
gcloud config set project YOUR_PROJECT_ID
```

Verify:

```bash
gcloud config list
```

### Set up Application Default Credentials (ADC)

This project uses ADC for local development.

```bash
gcloud auth application-default login
```

Verify that ADC works:

```bash
gcloud auth application-default print-access-token
```

If you receive an access token, ADC is working correctly.

### Create local environment files

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env`

```env
PORT=8787
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=global
MAX_TRANSLATION_CHARS=12000
CHUNK_SIZE_CHARS=3000
```

`client/.env`

```env
VITE_API_BASE_URL=/api
```

### Start the local app

```bash
npm run dev
```

Available local endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`
- Health check: `http://localhost:8787/api/health`

### Health check

```bash
curl http://localhost:8787/api/health
```

Expected response:

```json
{"status":"ok"}
```

## How Credentials Work In This Project

The browser never talks directly to Google Cloud.

The flow is:

1. The browser sends a request to `/api/translate`
2. The Express backend validates the request
3. The backend dispatches the request to either:
   - `NMT`
   - `LLM`
4. The backend returns the translated response to the frontend

This means:

- Google credentials stay on the server
- Production deployments remain private by design

## API Summary

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

## Production Deployment Overview

The recommended deployment shape is:

- A Linux server such as Ubuntu
- `nginx` as a reverse proxy
- `systemd` to run the backend process
- Static frontend assets served from `client/dist`
- Node backend served from `server/dist/index.js`
- SSL via Let's Encrypt
- A Google Cloud service account JSON file stored securely on the server

## Production Deployment Guide

The steps below assume an Ubuntu-based server.

### 1. Connect to your server

```bash
ssh root@YOUR_SERVER_IP
```

Or use a non-root sudo user:

```bash
ssh your-user@YOUR_SERVER_IP
```

### 2. Update packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Install Nginx, Git, curl, and Node.js

```bash
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:

```bash
node -v
npm -v
nginx -v
```

### 4. Create an app directory

```bash
sudo mkdir -p /var/www/google-cloud-translation-llm-nmt
sudo chown -R $USER:$USER /var/www/google-cloud-translation-llm-nmt
cd /var/www/google-cloud-translation-llm-nmt
```

### 5. Clone the repository

```bash
git clone https://github.com/devtulkin/google-cloud-translation-llm-nmt.git .
```

### 6. Install dependencies and build

```bash
npm install
npm run build
```

## Production Google Cloud Credential Setup

For production, do not rely on `gcloud auth application-default login` on the server unless you explicitly want user-based credentials on that machine. The recommended path is a dedicated service account.

### 1. Create a service account

In Google Cloud Console:

- Go to `IAM & Admin`
- Open `Service Accounts`
- Click `Create Service Account`

Example service account name:

```text
translation-runtime
```

### 2. Grant only the required permissions

Permissions vary by project policy and API configuration, but the runtime identity must be allowed to call the translation services used by the app.

Use the principle of least privilege.

### 3. Create a JSON key

In the service account page:

- Open `Keys`
- Click `Add key`
- Select `Create new key`
- Choose `JSON`

Download the JSON file.

### 4. Place the JSON file on the server

```bash
sudo mkdir -p /opt/google-cloud-translation-llm-nmt/secrets
sudo nano /opt/google-cloud-translation-llm-nmt/secrets/gcp-service-account.json
sudo chmod 600 /opt/google-cloud-translation-llm-nmt/secrets/gcp-service-account.json
```

Paste the downloaded JSON into that file.

## Production Environment Variables

Create a production env file:

```bash
sudo nano /etc/google-cloud-translation-llm-nmt.env
```

Example:

```env
PORT=8787
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=global
MAX_TRANSLATION_CHARS=12000
CHUNK_SIZE_CHARS=3000
GOOGLE_APPLICATION_CREDENTIALS=/opt/google-cloud-translation-llm-nmt/secrets/gcp-service-account.json
```

Important:

- `GOOGLE_APPLICATION_CREDENTIALS` should point to the service account JSON file
- `GOOGLE_CLOUD_PROJECT` must match the GCP project used by the APIs

## systemd Setup

Create a systemd service:

```bash
sudo nano /etc/systemd/system/google-cloud-translation-llm-nmt.service
```

Service file:

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

Update ownership:

```bash
sudo chown -R www-data:www-data /var/www/google-cloud-translation-llm-nmt
```

Start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable google-cloud-translation-llm-nmt
sudo systemctl start google-cloud-translation-llm-nmt
sudo systemctl status google-cloud-translation-llm-nmt
```

View logs:

```bash
journalctl -u google-cloud-translation-llm-nmt -f
```

## Nginx Reverse Proxy Setup

Create an Nginx site config:

```bash
sudo nano /etc/nginx/sites-available/app.example.com
```

Example config:

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

Enable the config:

```bash
sudo ln -s /etc/nginx/sites-available/app.example.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## DNS Setup

Point your domain or subdomain to the server's public IP address.

Example DNS record:

- Type: `A`
- Hostname: your chosen hostname
- Value: your server IP

Verify:

```bash
dig app.example.com +short
```

## SSL Setup With Let's Encrypt

Install Certbot:

```bash
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

Issue a certificate:

```bash
sudo certbot --nginx -d app.example.com
```

Verify renewal:

```bash
sudo certbot renew --dry-run
```

## Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Deploy / Update Workflow

When you update the code:

```bash
cd /var/www/google-cloud-translation-llm-nmt
git pull
npm install
npm run build
sudo systemctl restart google-cloud-translation-llm-nmt
sudo systemctl reload nginx
```

## Production Checklist

Before calling the deployment complete, verify all of the following:

- Google Cloud billing is enabled
- `translate.googleapis.com` is enabled
- `aiplatform.googleapis.com` is enabled
- `GOOGLE_CLOUD_PROJECT` is set correctly
- The service account has the required permissions
- `GOOGLE_APPLICATION_CREDENTIALS` points to a real JSON file on disk
- `npm run build` completes successfully on the server
- The backend service is active in `systemd`
- `nginx -t` passes
- DNS resolves to the correct server IP
- SSL is active and browser traffic loads over HTTPS
- `GET /api/health` returns `{"status":"ok"}`
- Both `LLM` and `NMT` translation paths work in production

## Health Checks

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

## Troubleshooting

### `GOOGLE_CLOUD_PROJECT is required`

Cause:

- The backend env file does not define `GOOGLE_CLOUD_PROJECT`

Fix:

- Add it to `server/.env` locally or your production env file on the server

### Authentication errors

Cause:

- ADC has not been configured locally
- The wrong Google account was used
- The production service account JSON path is incorrect

Fix:

Local:

```bash
gcloud auth application-default revoke
gcloud auth application-default login
```

Production:

- Verify `GOOGLE_APPLICATION_CREDENTIALS`
- Verify file permissions
- Verify the JSON file contents

### API disabled errors

Cause:

- `translate.googleapis.com` or `aiplatform.googleapis.com` is not enabled

Fix:

```bash
gcloud services enable translate.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### Permission denied

Cause:

- The Google user or service account does not have the required access

Fix:

- Review IAM roles and project access

### Nginx returns `502 Bad Gateway`

Cause:

- The backend is not running
- The backend is not listening on the expected port
- `proxy_pass` points to the wrong port

Fix:

```bash
sudo systemctl status google-cloud-translation-llm-nmt
journalctl -u google-cloud-translation-llm-nmt -f
curl http://127.0.0.1:8787/api/health
```

### SSL certificate request fails

Cause:

- DNS does not point to the server yet
- Ports `80` and `443` are blocked
- Nginx config is invalid

Fix:

- Verify DNS propagation
- Open firewall ports
- Run `sudo nginx -t`

## FAQ

### Why does the app use a backend instead of calling Google Cloud directly from the browser?

Because Google Cloud credentials must stay private. Exposing them in frontend code would be insecure.

### Can I deploy this without DigitalOcean?

Yes. Any Linux server or VM that can run Node.js, Nginx, and store Google Cloud credentials securely will work.

### Can I use Docker instead of systemd and Nginx?

Yes. This repository does not require Docker, but you can containerize both the frontend and backend if that fits your infrastructure.

### Can I use only NMT or only LLM?

Yes. The app supports both, but you can simplify the UI and backend if you want to expose only one translation path.

### Does this app support browser-side Google authentication?

No. The design intentionally keeps Google authentication on the backend.

### Can I add more languages?

Yes, but you should first confirm language support for both `Translation LLM` and `NMT` in Google Cloud, then update:

- frontend language options
- backend validation
- test coverage

### Is local ADC suitable for production?

Usually no. Production should use a service account or another server-safe identity mechanism.

## Security Notes

- Do not commit `.env` files
- Do not commit service account JSON files
- Keep credentials outside the repository
- Use `chmod 600` for production credential files
- Restrict server access and expose only the ports you need

## Useful Commands

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

## Recommended First-Time Setup Checklist

If you are installing this for the first time, follow this order:

1. Create a Google Cloud project
2. Enable billing
3. Enable `translate.googleapis.com`
4. Enable `aiplatform.googleapis.com`
5. Clone the repository
6. Run `npm install`
7. Run `gcloud auth login`
8. Run `gcloud config set project YOUR_PROJECT_ID`
9. Run `gcloud auth application-default login`
10. Create `server/.env`
11. Set `GOOGLE_CLOUD_PROJECT`
12. Run `npm run dev`
13. Verify the UI loads
14. Run `npm test`
15. Run `npm run build`
16. For production, set up the service account, env file, systemd, nginx, DNS, and SSL

## References

- [Google Cloud Translation](https://cloud.google.com/translate)
- [Vertex AI Translation](https://cloud.google.com/vertex-ai/generative-ai/docs/translate/translate-text)
- [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)
- [DigitalOcean DNS](https://docs.digitalocean.com/products/networking/dns/)
- [Certbot](https://certbot.eff.org/)
