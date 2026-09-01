import express, { Request, Response } from 'express';
import { testConnection } from "./db/db";
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express with TypeScript!');
});


async function startServer() {
  await testConnection();

  app.listen(5000, () => {
    console.log(`Server running on port"${port}`);
  });
}

startServer();