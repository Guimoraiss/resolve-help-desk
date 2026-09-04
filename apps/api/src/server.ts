import { buildApp } from "./app.js";
import { loadEnvironment } from "./config/env.js";

const app = await buildApp();
const environment = loadEnvironment();

try {
  await app.listen({ port: environment.PORT, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
