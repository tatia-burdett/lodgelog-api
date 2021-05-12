# LodgeLog API

## Summary:

This server-side project was built along with a client-side React app, which can be viewed [here](https://github.com/tatia-burdett/lodgelog-app). The app was deployed through Heroku. 

## Tech Details:

This project was created using: 
* Node.js
* Express
* PostgreSQL

## See it live:

[Live link](https://lodgelog-app-tatia-burdett.vercel.app/)

## REST API - Endpoints

* GET & POST - /api/user
* DELETE - /api/user/:id
* POST - /api/login
* POST - /api/refresh
* GET & POST - /api/address
* GET - /api/user/:userid
  - gets all addresses for specified user ID
* GET & DELETE & PATCH  - /api/address/:id

## Screenshots of Associated React App

### Landing Page
![Landing Page Header](screenshots/landing-page.png)

### Login Page
![View Posts](screenshots/login.png)

### Dashboard / Timeline
![View Single Post](screenshots/timeline.png)