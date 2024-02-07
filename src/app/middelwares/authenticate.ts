import { Router, Request, Response, RequestHandler } from 'express';
import { verify } from '../../services/jwt';

function authenticate(req: Request, res: Response, next: RequestHandler) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).send('Token required');

        const payload = verify(token);
        res.status(403).send('Invalid or expired token');
    } catch (er) {

    }
}

export default authenticate;