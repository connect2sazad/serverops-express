import { PORT } from "./config/config.js";
import app from "./entry.js";


const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default server;