// db.js (version dev)
const mysql = require("mysql2/promise");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const db = mysql.createPool({
    host: isProduction ? process.env.DB_HOST : "localhost",
    user: isProduction ? process.env.DB_USER : "root",
    password: isProduction ? process.env.DB_PASSWORD : "",
    database: isProduction ? process.env.DB_NAME : "emargement_db",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
});

module.exports = db;
