# Note: Must edit zip command manually to add new files to deployment
echo "Compressing app"
zip -q -r app.zip bin/ public/ views/ app.js package-lock.json package.json upload.nosync/photos.json projects/projects.json Caddyfile deploy.sh README.md

echo "Transferring app"
scp app.zip root@brunson.me:/root

echo "Installing app"
ssh root@brunson.me << EOF
  export NODE_ENV=production
  echo "Decompressing app"
  unzip -q -o app.zip -d app
  rm app.zip
  cd app
  echo "Installing node modules"
  npm install
  echo "Restarting server"
  pm2 stop www
  pm2 start ./bin/www
  echo "Reloading Caddy"
  caddy reload --config=/root/app/Caddyfile
EOF

rm app.zip

echo "Deployment complete"