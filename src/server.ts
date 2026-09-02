import express from "express";
import cors from "cors";
import routes from "./routes/index";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

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
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Welcome to the API",
  });
});

app.use("/api", routes);

async function startServer() {
    console.log("START SERVER CALLED");

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (error) => {
    console.error("SERVER ERROR:", error);
  });
}

startServer().catch((error) => {
  console.error("START SERVER ERROR:", error);
  process.exit(1);
});