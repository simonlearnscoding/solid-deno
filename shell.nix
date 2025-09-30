{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  buildInputs = [
    pkgs.docker
    pkgs.docker-compose
    pkgs.lazydocker
  ];

  packages = [
    (pkgs.writeShellScriptBin "start-services" ''
      echo "Starting services..."
      docker-compose -f docker-compose.dev.yml up -d
      echo "Services started! Run lazydocker to monitor"
    '')
    (pkgs.writeShellScriptBin "stop-services" ''
      echo "Stopping services..."
      docker-compose -f docker-compose.dev.yml down
      echo "Services stopped!"
    '')
    (pkgs.writeShellScriptBin "restart-services" ''
      stop-services
      sleep 2
      start-services
    '')
    (pkgs.writeShellScriptBin "service-logs" ''
      docker-compose -f docker-compose.dev.yml logs -f
    '')
    (pkgs.writeShellScriptBin "service-status" ''
      docker-compose -f docker-compose.dev.yml ps
    '')
  ];

  shellHook = ''
    if ! docker info >/dev/null 2>&1; then
      echo "⚠️  Docker daemon is not running"
      echo "   Start it with: sudo systemctl start docker"
    else
      echo "✅ Docker daemon is running"
    fi

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
