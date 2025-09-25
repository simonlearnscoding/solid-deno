{pkgs ? import <nixpkgs> {config = {allowUnfree = true;};}}:
pkgs.mkShell {
  buildInputs = [
    pkgs.docker
    pkgs.docker-compose
    pkgs.lazydocker
    # pkgs.nodejs
    # pkgs.typescript
    # pkgs.nodePackages.typescript-language-server
    # pkgs.redis
  ];

  shellHook = ''
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
      echo "⚠️  Docker daemon is not running"
      echo "   Start it with: sudo systemctl start docker"
    else
      echo "✅ Docker daemon is running"
    fi

    # Function to start services
    start-services() {
      echo "Starting services..."
      docker-compose -f docker-compose.dev.yml up -d
      echo "Services started! Run 'lazydocker' to monitor"
    }

    # Function to stop services
    stop-services() {
      echo "Stopping services..."
      docker-compose -f docker-compose.dev.yml down
      echo "Services stopped!"
    }

    # Function to restart services
    restart-services() {
      stop-services
      sleep 2
      start-services
    }

    # Function to view logs
    service-logs() {
      docker-compose -f docker-compose.dev.yml logs -f
    }

    # Function to check service status
    service-status() {
      docker-compose -f docker-compose.dev.yml ps
    }

    echo "🚀 Docker, Docker Compose, and Lazydocker are ready!"
    echo ""
    echo "📋 Available commands:"
    echo "   start-services      - Start MongoDB and backend"
    echo "   stop-services       - Stop all services"
    echo "   restart-services    - Restart all services"
    echo "   service-logs        - View service logs"
    echo "   service-status      - Check service status"
    echo "   lazydocker          - Monitor containers (TUI)"
    echo ""
    echo "💡 Run 'start-services' when you need MongoDB running"
  '';
}
