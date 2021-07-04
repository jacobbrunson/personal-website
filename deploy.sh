echo "Installing app"

echo "Connecting to server via SSH"
ssh jacob@brunson.me << EOF
  echo "Deleting app"
  rm -rf personal-website
  echo "Cloning app"
  git clone https://github.com/jacobbrunson/personal-website
  cd personal-website
  echo "Stopping existing Docker containers"
  docker-compose down
  echo "Starting Docker containers"
  docker-compose up -d
EOF

echo "Deployment complete"