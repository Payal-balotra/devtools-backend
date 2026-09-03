import express from 'express';
import { login, refreshToken, register ,getUserInfo,logout} from '../controller/user.controller';


const router = express.Router();

router.post('/login', login)   
router.post('/register', register);
router.post('/logout',logout)
router.post('/renew-token',refreshToken );
router.get("/me",getUserInfo);

export default router;

