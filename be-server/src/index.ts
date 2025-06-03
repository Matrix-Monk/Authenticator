import express from "express";
import cors from "cors";
import router from "./routes/auth.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import { PORT, FRONTEND_URL } from "./config.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.use(router);


app.use(authMiddleware);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome", user: (req as any).user });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});