{pkgs ? import <nixpkgs> {config.allowUnfree = true;}}:
pkgs.mkShell {
  buildInputs = [
    pkgs.docker
    pkgs.podman-compose
    pkgs.netcat
  ];

  shellHook = ''
    # Start MongoDB if not running (check TCP port 27017)
    if ! nc -z localhost 27017; then
      echo "Starting MongoDB container..."
      podman-compose up -d

      while ! nc -z localhost 27017; do
        sleep 1
        echo "Waiting for MongoDB to start..."
      done
    else
      echo "MongoDB is already running"
    fi
  '';
}
