import express from "express";
import cors from "cors";
import { testConnection } from "./db/db";
import routes from "./routes/index";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();
const port = 5000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(limiter);

app.use(helmet());

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  console.log("ORIGIN:", req.headers.origin);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

app.use("/api", routes);

async function startServer() {
  await testConnection();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();