# Development with Docker Compose

This project is configured to run in a development environment using Docker Compose, which provides hot reloading when files are changed and a PostgreSQL database for persistence.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Node.js and npm (for local development without Docker)

## Getting Started with Docker

1. Start the development environment:

```bash
docker-compose up
```

This command will:
- Build the Docker image using the Dockerfile.dev configuration
- Start the PostgreSQL database
- Mount your local source code into the container
- Run the application in watch mode for automatic reloading

2. To stop the development environment:

```bash
docker-compose down
```

3. To rebuild the Docker image after changing dependencies:

```bash
docker-compose build
```

4. To view logs:

```bash
docker-compose logs -f api
```

## Database Connection

The application automatically connects to the PostgreSQL database with these configuration values:

- Host: db
- Port: 5432
- Username: postgres
- Password: pass123
- Database: coffee_app_dev

## Development Workflow

1. Make changes to your code
2. The application will automatically restart
3. If you add new dependencies to package.json, you'll need to rebuild the image with `docker-compose build`
