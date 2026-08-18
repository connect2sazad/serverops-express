import app from 'app.js'
import { PORT } from './config/config';


const app = exp();

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(PORT, () => {
    console.log(`Port running at ${PORT}`)
})