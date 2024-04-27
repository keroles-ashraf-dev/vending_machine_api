import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from 'app/routes/v1/auth.routes';
import coinRoutes from 'app/routes/v1/coin.routes';
import depositionRoutes from 'app/routes/v1/deposition.routes';
import productRoutes from 'app/routes/v1/product.routes';
import purchaseRoutes from 'app/routes/v1/purchase.routes';
import userRoutes from 'app/routes/v1/user.routes';
import { client_origin_url } from 'config/app.config';
import errorCatch from './middlewares/error_catch';
import rateLimiting from './middlewares/rate.limiting';

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
app.use(rateLimiting); // set rate limiting middleware

app.use('/api/v1', authRoutes);
app.use('/api/v1', coinRoutes);
app.use('/api/v1', depositionRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', purchaseRoutes);
app.use('/api/v1', userRoutes);

app.use(errorCatch); // Error handler middleware

export default app;