import express from 'express'
import logger from 'morgan'
import dotenv from 'dotenv/config'
import { Server } from  'socket.io'
import { createServer } from 'node:http'
import { createClient } from '@libsql/client'
const PORT = process.env.PORT ?? 3000
const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        
    }
})

const db = createClient({
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN
})


await db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
  )
`)
io.on('connection', async (socket) => {
    console.log('a user has connected!')

    // Si se desconecta
    socket.on('disconnect', () => {
        console.log('an user has disconnect!')
    })
    // Si se envia un mensaje
    socket.on('chat message', async (msg) => {
        let result
        try {
            result = await db.execute({
                sql: `INSERT INTO messages (content) VALUES (:msg) `,
                args: { msg }
            })
        } catch (err) {
            console.error(err)
            return
        }
        io.emit('chat message', msg, result.lastInsertRowid.toString())
    })

    if(!socket.recovered){
        try {
            const results = await db.execute({
                sql: 'SELECT id, content FROm messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })
            results.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString())
            });
        } catch (error) {
            console.error(error);
            return
        }
    }
})

// Middlewares
app.use(logger('dev'))


app.get('/', (req, res ) => {
    // Renderizar el archivo HTML
    // process.cwd() -> Dónde se inicializa el proceso (Root)
    res.sendFile(process.cwd() + '/client/index.html');
})


server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
})