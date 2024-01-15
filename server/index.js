import express from 'express'
import logger from 'morgan'
import { Server } from  'socket.io'
import { createServer } from 'node:http'

const PORT = process.env.PORT ?? 3000
const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        
    }
})

io.on('connection', (socket) => {
    console.log('a user has connected!')

    // Si se desconecta
    socket.on('disconnect', () => {
        console.log('an user has disconnect!')
    })
    // Si se envia un mensaje
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg)
    })
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