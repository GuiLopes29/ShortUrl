# ShortUrl

## Description

ShortUrl is a simple URL shortener service. It is a web application that allows users to enter a long URL and get a shortened version of it. The shortened URL can be used to redirect to the original URL. The application also provides a list of all the shortened URLs created by the user.

## Features

- Shorten URLs
- Redirect to original URL
- List all shortened URLs

## Technologies

- Node.js
- Express
- PostgreSQL
- NestJS
- Docker
- Docker Compose
- TypeORM
- Swagger

## Installation

1. Clone the repository
2. Install dependencies
3. Create a `.env` file based on the `.env.example` file
4. Start the PostgreSQL database
5. Start the application

```bash
$ git clone
$ cd shorturl
$ yarn install
$ cp .env.example .env
$ docker-compose up -d
$ yarn start
```

## Usage

All application will be available at `http://localhost:3000` if you are running it locally.

But it's also available on AWS at `http://ec2-18-231-116-58.sa-east-1.compute.amazonaws.com/` or the direct IP `http://18.206.223.89/`

## API Documentation

The API documentation is available at `http://localhost:3000/api`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

### 1.0.0

- Initial release with all the features and tests implemented.
```
