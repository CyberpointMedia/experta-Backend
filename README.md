# [✨Experta API✨](https://github.com/CyberpointMedia/experta-Backend)

> Experta is a platform designed for everyone. Access advice from industry professionals, influencers, career mentors, and more, or share what you know and connect with those who appreciate your expertise. Join us to learn, earn, and grow—wherever you are.

## Features

- Secure user authentication with JSON Web Tokens
- Role-based authorization for effective access control
- Performance optimization through caching with Redis
- Rate limiting to prevent API abuse by users
- Server-side form data validation to ensure integrity and prevent invalid or malicious submissions

## Technologies

This app utilizes modern technologies to build robust features that ensure seamless functionality and performance:

- [Node.js (22.12.0)](https://nodejs.org/): A JavaScript runtime built on Chrome's V8 JavaScript engine, used for building the backend API.
- [Express (4.21.2)](https://expressjs.com/en/4x/api.html): A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- [MongoDB (8.0.4)](https://www.mongodb.com): A NoSQL database known for its high performance, high availability, and easy scalability, used for storing application data.
- [Redis (7.4)](https://redis.io/): An open-source, in-memory data structure store, used as a database, cache, and message broker to enhance application performance.
- [Docker (2.32.0)](https://www.docker.com/): A platform for developing, shipping, and running applications in containers, ensuring consistency across multiple development and release cycles.

These technologies collectively ensure that the application is scalable, efficient, and easy to maintain.

## Prerequisites

- [Node.js](https://nodejs.org/) - Version 22 or higher
- [MongoDB](https://www.mongodb.com) - Local or cloud instance with the latest version
- [Docker](https://www.docker.com/) - Latest version for containerization

## Installation Steps for Local Environment

### Step 1: Clone the Repository

```sh
git clone https://github.com/CyberpointMedia/experta-Backend.git experta-backend
```

### Step 2: Create Environment Files

- Create `.env` for API development in the local environment

- Create `.env.docker` for containerizing the app with Docker Compose

```sh
cd experta-backend

```

> ⚠️ Update required local environment variables before the next steps

### Step 3: Run App in Local Environment

#### ✨ Create required service with Docker Compose for running app in local

> Follow the below steps to run the app:

- Step 1: Install [Docker Desktop](https://www.docker.com/get-started/)
- Step 2: Go to the project folder and open the command prompt
- Step 3: Make sure `.env.docker` is created and set with valid environment values
- Step 4: Create an external Docker network
  ```sh
  docker network create --driver=bridge expertanet
  ```
- Step 5: Run the Docker Compose command to create services container
  ```sh
  docker-compose --env-file .env.docker up --build -d
  ```
- Step 6: Open the app Docker container's terminal for mongodb service

  ```sh

  ```

- Step 7: Run the npm command to seed the database
  ```sh
  npm run seed
  ```
- Step 8: Type `exit` to leave the sh session
- Step 9: Navigate to `http://localhost:{APP_PORT}/api/v1` in your browser to view the site

To stop and remove all containers, networks, and volumes created by `docker-compose up`, use:
`sh
    docker-compose --env-file .env.docker down --rmi all --volumes
    `

> Use [Postman](https://www.postman.com/) to test the API

## Useful commands

## Usage
