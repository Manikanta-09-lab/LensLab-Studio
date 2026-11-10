const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db = null;

const initializeDB = async () => {
    db = await open({
        filename: './lenslab.db',
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON');

    // Photographers table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS photographers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT UNIQUE
        );
    `);

    // Cameras table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS cameras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            kind TEXT NOT NULL,
            brand TEXT NOT NULL,
            daily_rate REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'Available'
        );
    `);

    // Rentals table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS rentals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            photographer_id INTEGER NOT NULL,
            camera_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            total_cost REAL NOT NULL,
            FOREIGN KEY (photographer_id) REFERENCES photographers(id),
            FOREIGN KEY (camera_id) REFERENCES cameras(id)
        );
    `);

    console.log('Database and tables created successfully');
};

const getDB = () => db;

module.exports = {
    initializeDB,
    getDB
};