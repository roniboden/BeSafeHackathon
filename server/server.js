import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportRoutes from './routes/reportRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import {resetUsersWeeklyGoal} from './utils/databaseHelper.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_URL
}));

app.use('/reports', reportRoutes); // allows localhost:5000/reports
app.use('/shop', shopRoutes);

//reset weekly
resetUsersWeeklyGoal();

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
