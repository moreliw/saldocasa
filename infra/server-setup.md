# Setup inicial do servidor (executar UMA vez como root)

Já feito automaticamente:
- Chave `saldocasa_deploy.pub` instalada em `/root/.ssh/authorized_keys` e `/home/deploy/.ssh/authorized_keys`
- Diretório `/opt/saldocasa/` criado (owner deploy:deploy)

Passos manuais restantes (são poucos e precisam de root no host):

## 1) Copiar `.env` e `docker-compose.prod.yml` para o servidor

```bash
# do seu laptop:
scp -i ~/.ssh/saldocasa_deploy infra/docker-compose.prod.yml deploy@62.171.161.221:/opt/saldocasa/docker-compose.yml
# crie /opt/saldocasa/.env com POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, JWT_SECRET
```

O CI já cuida disso na primeira execução (faz upload do compose + escreve .env a partir das secrets).

## 2) Configurar Nginx do host

```bash
# como root no servidor:
cp /opt/saldocasa/nginx-saldocasa.conf /etc/nginx/sites-available/saldocasa.morelidev.com
ln -sf /etc/nginx/sites-available/saldocasa.morelidev.com /etc/nginx/sites-enabled/saldocasa.morelidev.com
nginx -t && systemctl reload nginx
```

## 3) TLS com Let's Encrypt

```bash
certbot --nginx -d saldocasa.morelidev.com --non-interactive --agree-tos -m admin@morelidev.com --redirect
```

Após isso, https://saldocasa.morelidev.com responde com TLS válido. Renovação automática já roda via systemd timer (certbot.timer).
