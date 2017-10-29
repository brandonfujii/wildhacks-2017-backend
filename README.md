# Wildhacks 2017 Backend

## Installation
  1. Clone this repository
  2. Make sure you have node version `6.11.0`. You can manage node versions with [nvm](https://github.com/creationix/nvm) if you already have node and npm. Otherwise, download [node](https://nodejs.org/en/) and [npm](https://github.com/npm/npm). You can check your node and npm versions by running `node -v` and `npm -v`.
  3. Once you have a valid version of node, `npm install` in the root project directory to download the project's dependencies and its flow-compatible counterparts.
  4. Acquire a `.env` and a `config` file from a WildHacks team member, or email brandonfujii2018@u.northwestern.edu, and place it in the root of the project.

## Local development
### Database
  1. You'll need [mysql](https://www.mysql.com/). They have pretty good setup instructions. 
    - If you use a Mac and want the absolute no-hassle installation, first install [Homebrew](https://brew.sh) and then follow [these instructions](https://gist.github.com/nrollr/3f57fc15ded7dddddcc4e82fe137b58e).
  2. Add Sequelize CLI `npm i -g sequelize-cli`
  3. Run `npm run db:create` to create your local database and run the table migrations in `migrations/`.
  4. Ensure that the database was created by signing into your mysql account. 
    - `mysql -u <username> -p`

### Running
  1. To run locally, `npm run start:dev` to transpile the source to `build/` and start a local web server. 
  2. Check `/ping`
