import express from "express";
import mysql from "mysql2/promise";

const app = express();
const port = 3000;
async function startServer() {
    let connection;
    let retries = 5;
    while (retries) {
        try {
            connection = await mysql.createConnection({
                host: 'mysql_db', 
                port: 3306,     
                user: 'root',
                password: '12345',
                database: 'miapp'
            });
            break; // Salir del bucle si la conexión es exitosa
        } catch (error) {
            console.error('Error conectando a MySQL, reintentando...', error);
            retries -= 1;
            await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos antes de reintentar
        }
    }

    if (!connection) {
        console.error('No se pudo conectar a MySQL después de varios intentos.');
        process.exit(1); 
    }

    // Crear tabla si no existe
    await connection.query(`CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        edad INT NOT NULL,
        ciudad VARCHAR(255) NOT NULL
    )`);

    // Rutas
    app.get("/", async (req, res) => {
        try {
            const [rows] = await connection.query("SELECT * FROM clientes");
            res.json(rows);
        } catch (error) {
            res.status(500).send("no permite consultar la base de datos.");
            console.error(error);
        }
    });

    app.post("/agregar", async (req, res) => {
        try {
            const { nombre, edad, ciudad } = req.query;
            await connection.query("INSERT INTO clientes (nombre, edad, ciudad) VALUES (?, ?, ?)", [nombre, edad, ciudad]);
            res.send("cliente agregado");
        } catch (error) {
            res.status(500).send("no permite agregar el cliente.");
            console.error(error);
        }
    });

    app.put("/actualizar", async (req, res) => {
        try {
            const { id, nombre, edad, ciudad } = req.query;
            await connection.query("UPDATE clientes SET nombre = ?, edad = ?, ciudad = ? WHERE id = ?", [nombre, edad, ciudad, id]);
            res.send("cliente actualizado");
        } catch (error) {
            res.status(500).send("no permite actualizar el cliente.");
            console.error(error);
        }
    });

    app.delete("/borrar", async (req, res) => {
        try {
            const { id } = req.query;
            await connection.query("DELETE FROM clientes WHERE id = ?", [id]);
            res.send("cliente borrado");
        } catch (error) {
            res.status(500).send("no permite borrar el cliente.");
            console.error(error);
        }
    });

    app.listen(port, () => {
        console.log('Servidor corriendo en http://localhost:${port}');
    });
}

startServer();