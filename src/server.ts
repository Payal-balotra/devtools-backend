import express, { Request, Response } from 'express';
import cors from 'cors';
import { testConnection } from "./db/db";
import routes from './routes/index';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

app.use(helmet())
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

app.use('/api',routes); 


async function startServer() {
  await testConnection();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();