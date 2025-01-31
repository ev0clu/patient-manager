# **Patient Manager App**

A health care full stack CRUD app has built with React Native framework, Nativewind, Nest.js, PostgreSQL, Docker and more. The app allows users to log in and booking an appointment to doctors or cancel a previous one. There is an admin part of the application also, where doctors can accept or reject the appointment. Additionally, users can update or remove their profile.

<!--
### Login:
- **Admin**:
   - email: admin@patient.com
   - password: admin1234
- **User**:
   - email: test@example.com
   - password: 1234

### Demo video: [Link](https://github.com/ev0clu/patient-manager/blob/main/demo.mp4)
-->

## Features

- Allow user to sign up and sing in to the platform
- Only those appointments are visible to users which are created by themself
- Booked appointment are marked as not available
- Only authorized users can book a new appointment or cancel an already exist one
- Authorized users can update or delete their profiles
- Typescript is used on frontend and backend to ensure everyting are type safety
- React Native is used for frontend
- NativeWind is used to stlye components
- Tanstack query is used to communicate with the backend and cache data
- Nest.js is used for backend
- PostgreSQL is used to store data
- Docker is used to run database locally
- JWT is used to handle login and allow access to the platform

## How to run from local repository

### Docker

Install Docker and Docker compose. Docker desktop automatically installs Docker Compose, but you can install it separately also.

- [Docker](https://docs.docker.com/desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Backend

1. Clone the repository
2. Navigate to **backend root** folder
3. Create **.env** file based on the **.env.example**
4. Run `npm install` command in your terminal
5. Run _docker-compose.dev.yml_ file:

   ```
   docker compose --env-file .env -f docker-compose.dev.yml -p patient-manager-dev up -d
   ```

6. Run `npm run prisma:migrate` to migrate and push the schema to database
7. Run `npm run prisma:seed` to add admin registration into the database. _email_: `admin@patient.com`, _password_: `admin1234`
8. Run `npm run dev`
9. Backend server running at `http://localhost:5000/`
10. Run `npm run prisma:studio` if you would like to see the database content

#### How to run backend test

1. Navigate to **backend root** folder
2. Create **.env.test** file based on the **.env.test.example**
3. Run _docker-compose.test.yml_ file from **backend root** folder:
   ```
   docker compose --env-file .env.test -f docker-compose.test.yml -p patient-manager-test up -d
   ```
4. Run `npm run prisma:push-test` to push schema to database
5. Run `npm run test` to run unit test

### Frontend

1. Navigate to **frontend root** folder
2. Create **.env** file based on the **.env.example**
3. Run `npm install` command in your terminal
4. Run `npm run start`
5. Frontend server running at `http://localhost:8081` or you can use Expo Go if you open the Expo app on your phone and scan the QR code from the terminal

## Dependencies

- [React Native](https://reactnative.dev/)
- [NativeWind](https://www.nativewind.dev/)
- [Expo](https://docs.expo.dev/)
- [Expo Go](https://expo.dev/go)
- [Typescript](https://www.typescriptlang.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://www.npmjs.com/package/jsonwebtoken)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [Jest](https://jestjs.io/docs/getting-started)
- [Supertest](https://www.npmjs.com/package/supertest)
- [Zod](https://zod.dev/)
