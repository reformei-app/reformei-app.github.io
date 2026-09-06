FROM caddy:2-alpine

WORKDIR /srv
COPY index.html precos.json /srv/
COPY Caddyfile /etc/caddy/Caddyfile

# A imagem oficial do Caddy já executa:
#   caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
