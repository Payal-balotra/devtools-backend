import express from 'express';
import { login, refreshToken } from '../controller/user.controller';


const router = express.Router();

router.post('/login', login)    
router.post('/renew-token',refreshToken );

export default router;

