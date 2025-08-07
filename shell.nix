{pkgs ? import <nixpkgs> {config = {allowUnfree = true;};}}:
pkgs.mkShell {
  buildInputs = [
    pkgs.docker
    pkgs.podman-compose
    # pkgs.nodejs
    # pkgs.typescript
    # pkgs.nodePackages.typescript-language-server
    # pkgs.redis
  ];

  shellHook = ''

    # Start MongoDB if not running
    if ! curl -s http://localhost:27017/ >/dev/null; then
      echo "Starting MongoDB container..."
      podman-compose up -d

      while ! curl -s http://localhost:27017/ >/dev/null; do
        sleep 1
        echo "Waiting for MongoDB to start..."
      done
    else
      echo "MongoDB is already running"
    fi

    # # Start Redis if not running
    # if ! redis-cli ping | grep -q PONG; then
    #   echo "Starting Redis server..."
    #   redis-server --daemonize yes > /dev/null 2>&1
    #   while ! redis-cli ping | grep -q PONG; do
    #     sleep 1
    #     echo "Waiting for Redis to start..."
    #   done
    # else
    #   echo "Redis is already running"
    # fi
  '';
}
