import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportRoutes from './routes/reportRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import authRoutes from './routes/authRoutes.js';
import tipRoutes from './routes/tipRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import {resetUsersWeeklyGoal} from './utils/databaseHelper.js';

dotenv.config();

const app = express();

app.use(express.json());

// app.use(cors({
//   origin: process.env.CLIENT_URL
// }));
app.use(cors());

app.use('/reports', reportRoutes); // allows localhost:5000/reports
app.use('/shop', shopRoutes);
app.use('/auth', authRoutes);
app.use('/tips', tipRoutes);
app.use("/simulations", simulationRoutes);

//reset weekly
resetUsersWeeklyGoal();

app.use((err, _req, res, _next) => {
  void _next; //disable eslint error

  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
    reason: err.reason
  });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
