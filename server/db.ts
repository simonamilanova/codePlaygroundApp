import {Client} from "pg";

const dbClient = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'simona123',
    database: "postgres"
})

export default dbClient;