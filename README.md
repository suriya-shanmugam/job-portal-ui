# Job Portal UI

A React-based job portal user interface with job listing, analysis, and application features.

## Prerequisites

- Docker
- Docker Compose

## Installation and Running with Docker

1. First, ensure Docker is installed and running on your system:
   ```bash
   # For Ubuntu/Debian
   sudo systemctl start docker
   
   # For macOS/Windows
   # Start Docker Desktop
   ```

2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd job-portal-ui
   ```

3. Build and run the Docker container:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. Access the application:
   - Open your browser and navigate to `http://localhost:3001`
   - The API should be running on `http://localhost:3000`

## Docker Commands

- Start the application:
  ```bash
  docker-compose up -d
  ```

- Stop the application:
  ```bash
  docker-compose down
  ```

- View logs:
  ```bash
  docker-compose logs -f job-portal-ui
  ```

- Rebuild the container:
  ```bash
  docker-compose build --no-cache
  ```

## Troubleshooting

1. If Docker daemon is not running:
   ```bash
   # For Ubuntu/Debian
   sudo systemctl start docker
   
   # Check status
   sudo systemctl status docker
   ```

2. If port 3001 is already in use:
   - Modify the port mapping in `docker-compose.yml`
   - Change `"3001:80"` to another port like `"3002:80"`

3. If API connection fails:
   - Ensure the backend API is running on `http://localhost:3000`
   - Check the `REACT_APP_API_URL` environment variable in `docker-compose.yml`

## Development

For local development without Docker:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

## Project Structure

```
job-portal-ui/
├── src/
│   ├── components/     # React components
│   ├── services/       # API services
│   └── App.js         # Main application component
├── public/            # Static files
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── nginx.conf         # Nginx configuration for production
└── .dockerignore      # Docker ignore file