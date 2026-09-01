import express from 'express';
import { login, refreshToken, register } from '../controller/user.controller';


const router = express.Router();

router.post('/login', login)   
router.post('/register', register);
router.post('/renew-token',refreshToken );

export default router;

