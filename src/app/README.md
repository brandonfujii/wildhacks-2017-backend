# API Reference

Unless explicitly stated, all routes expect requests signed with `application/json` content-types. 

All requests to the following endpoints must include a header `X-Access-Token`, which must have a valid token value. A user can retrieve a valid token by registering (`auth/register`) and logging in (`auth/login`).

Certain endpoints are admin-protected, meaning that they require either a `privileges` value of `admin` in the requester's user model OR the request includes of header `X-Access-Gatekey` with a valid value.

## Routes
 - [User Authentication](#user-authentication)
 - [Users](#users)
 - [Events](#events)

## User Authentication

  #### POST `/auth/register`

  Example request body: 

  ```
  {
    "email": "willie@northwestern.edu",
    "password": "hunter2"
  }
  ```

  Example 200 response body:

  ```
  {
    "success": true,
    "user": {
        "id": 1,
        "email": "willie@northwestern.edu",
        "password": "$2a$10$JC9xRi4W7ST9lYw2ChdsXOG5k0e3vcYP7dzSH2HsVk1fbsdpvlsL.",
        "privilege": "user",
        "updatedAt": "2017-08-12T03:17:19.499Z",
        "createdAt": "2017-08-12T03:17:19.499Z"
    }
  }
  ```
  
  A successful response body should contain:
  * a true success value
  * the newly created user entity should comprise of:
      * a user id
      * the given email
      * a hashed password
      * specified privileges ('user' OR 'admin')
      * timestamps
      
 #### POST `/admin/register` (admin)
 Registers a user with admin privileges.
      
 #### POST `/auth/login`
 
 Example request body: 

  ```
  {
    "email": "willie@northwestern.edu",
    "password": "hunter2"
  }
  ```
 
 Example 200 response body:
 
 ```
 {
    "user": {
        "id": 1,
        "email": "willie@northwestern.edu",
        "password": "$2a$10$JC9xRi4W7ST9lYw2ChdsXOG5k0e3vcYP7dzSH2HsVk1fbsdpvlsL.",
        "privilege": "user",
        "type": "student",
        "tokenId": 1,
        "applicationId": null,
        "createdAt": "2017-08-07T03:54:44.000Z",
        "updatedAt": "2017-08-07T03:54:58.000Z",
        "teamId": null,
        "token": {
            "id": 1,
            "userId": 1,
            "value": "eyJhbGciOiJIUz...42QZ8yE",
            "createdAt": "2017-08-07T03:54:58.000Z",
            "updatedAt": "2017-08-10T21:03:31.000Z"
        },
        "application": null,
        "events": []
    }
 }
 ```
    
## Users
 #### GET `user/all?page=:page&limit=:limit`
 Retrieves a page of users. Page corresponds to the page number, which is indexed at 1. The limit corresponds to the number of users on each page. Page number defaults to 1 and the limit defaults to 10.

 #### GET `user?id=:id`
 Get user by id
 
 #### GET `user?email=:email`
 Get user by email
 
 #### POST `user/check-in` (admin)
 Checks a user into an event based on user id and event id and creates a `check_in` instance. This endpoint requires admin privileges. 
 
 Example request body: 

  ```
  {
    "event_id": 4,
    "user_id": 1
  }
  ```
  
  Example 200 response body:
  
  ```
  {
   success: true,
   message: "willie@northwestern.edu checked into Meal #1" 
  }
  ```
## Events

 #### GET `event/all`
 Retrieves all events

 #### GET `event?id=:id`
 Get event by id
  
