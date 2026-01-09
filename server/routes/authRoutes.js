import express from 'express';

import {login} from '../controllers/loginController.js';
import {register} from '../controllers/registerController.js';

const router = express.Router();

// POST - login
router.post('/login', login);
router.post('/register', register);


export default router;
