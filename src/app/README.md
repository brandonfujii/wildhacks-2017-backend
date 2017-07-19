# API Notes

## Routes
 - [Authentication](#authentication)
 - [Users](#users)
 - [Admin](#admin)

## Authentication
 Prefix: `/auth`.

 **POST** `/register` => `User`
   - Registers a user 
   - Expects a request body with `email` and `password` (Required)
   - Allows `firstName`, `lastName`, and `privilege` in request body (Optional)

 **POST** `/login` => `{ User, Token }`
   - Verifies email and password and gives back an authorization token and the user you've logged in as
   - Expects an `email` and `password` in request body

## Users
 Prefix: `/user`.
 Requires `X-Access-Token` to access

 **GET** `/` => `User`
    - Finds a single user with a matching id and/or email
    - Expects either an `email` or `id` query parameter, or both

 **GET** `/all` => `Array<User>`
    - Retrieves a page of users
    - Allows an optional `page` query parameter to specify which user page you wish to receive
    - Limits each page to 10 users

## Admin
 Prefix: `/admin`.
 Requires `X-Access-Token` AND admin `privilege` or `X-Access-Gatekey` to access

 **POST** `/register` => `User`
   - Creates a user with admin privileges
   - Expects a request body with `email` and `password` (Required)
   - Allows `firstName` and `lastName` in request body (Optional)

