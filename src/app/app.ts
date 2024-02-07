import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import userRoutes from 'app/routes/v1/user.routes';
import { client_origin_url } from 'src/config/app.config';

const app = express();

app.use(bodyParser.json()); // parse requests of content-type - application/json
app.use(bodyParser.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded
app.use(helmet()); // set secure HTTP response headers
app.use(
    cors({
        origin: client_origin_url, // pecify the allowed origins
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: '*' // or specify the allowed headers
    })
);

app.use('/api/v1', userRoutes);

export default app;