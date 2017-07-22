# Wildhacks 2017 Backend

## Installation
  1. Clone this repository
  2. Make sure you have node version `6.11.0`. You can manage node versions with [nvm](https://github.com/creationix/nvm) if you already have node and npm. Otherwise, download [node](https://nodejs.org/en/) and [npm](https://github.com/npm/npm). You can check if you've installed them by `node -v` and `npm -v`. 
  3. Once you have a valid version of node, `npm install` in the root project directory to download the project's dependencies.
  4. Run `npm run flow-assets` to generate flow-compatible node libraries from your `node_modules`.
  5. Create your configuration file. Create files `config/default.json` and `config/sequelize.json`. Ask brandon for valid credentials.


## Database
  1. You'll need [mysql](https://www.mysql.com/). They have pretty good setup instructions. 
    - If you use a Mac and want the absolute no-hassle installation, first install [Homebrew](https://brew.sh) and then follow [these instructions](https://gist.github.com/nrollr/3f57fc15ded7dddddcc4e82fe137b58e).
  2. Run `npm run db:create`. It's a script that logs into mysql with the credentials you provide in `config/sequelize.json` and creates the local databases you'll need.
  3. Check that this works by signing into your mysql account. 
    - `mysql -u <username> -p`
    - Once you enter in your password and login, `show databases;`. You should see `wildhacks2017_dev`, `wildhacks2017_prod`, and `wildhacks2017_prod`.
  4. Now you can run `npm run db:migrate` to create your tables within your development database.

## Running
  1. `npm run build` to transpile the code into `build/` and run the server.
  2. Check `/ping`
