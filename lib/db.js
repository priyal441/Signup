import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",   
  password: "WJ28@krhps",     
  database: "auth_app"
});

export default db;


















