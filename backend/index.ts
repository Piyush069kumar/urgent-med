import express, { type Express, type Request, type Response } from "express";
import http from "http";

import { initPassport } from "./app/common/services/passport-jwt.service";
import { loadConfig } from "./app/common/helper/config.hepler";
import errorHandler from "./app/common/middleware/error-handler.middleware";
import routes from "./app/routes";
import cors from "cors";
import path from "path";

loadConfig();

const port = Number(process.env.PORT) || 5000;

const app: Express = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const initApp = async (): Promise<void> => {
  // passport init
  initPassport();
  // set base path to /api
  app.use("/api", routes);

  // Serve media files
  const mediaPath = path.join(__dirname, "uploads");
  app.use("/uploads", express.static(mediaPath));

  app.get("/", (req: Request, res: Response) => {
    res.send({ status: "ok" });
  });

  // error handler
  app.use(errorHandler);
  http.createServer(app).listen(port, () => {
    console.log("Server is runnuing on port", port);
  });
};

void initApp();
