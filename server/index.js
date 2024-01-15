import express from 'express'
import logger from 'morgan'

const PORT = process.env.PORT ?? 3000


const app = express();


// Middlewares
app.use(logger('dev'))


app.get('/', (req, res ) => {
    // Renderizar el archivo HTML
    // process.cwd() -> Dónde se inicializa el proceso (Root)
    res.sendFile(process.cwd() + '/client/index.html');
})


app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
})