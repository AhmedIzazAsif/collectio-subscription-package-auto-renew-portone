import "dotenv/config";
import fastify from "fastify";
import fastifyRequestContext from "@fastify/request-context";
import fastifyFormbody from "@fastify/formbody";
import Ajv from "ajv";
import { startProcess } from "./process";
import { checkAuthentication } from "../utils/auth";
export const EXTERNAL_API_BASE = process.env.EXTERNAL_API_BASE;
export const EXTERNAL_API_VERSION = process.env.EXTERNAL_API_VERSION;
const app = fastify();
const PORT = +(process.env.PORT || 5000);

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  allErrors: false,
});

app.setValidatorCompiler(({ schema }) => {
  return ajv.compile(schema);
});

async function buid() {
  app.register(fastifyRequestContext);
  app.register(fastifyFormbody);
  return app;
}

buid().then((app) => {
  app.listen(
    {
      port: PORT,
      host: "0.0.0.0",
    },
    (err) => {
      if (err) console.log(err);
      console.log(`server is listening on port ${PORT}`);
      setInterval(async () => {
        let authenticated = await checkAuthentication();
        if (authenticated) {
          startProcess()
            .then(() => console.log("Process completed successfully"))
            .catch((error) => console.log("Process failed with: " + error));
        } else {
          console.log(
            "Authentication failed, please check your credential in environment"
          );
        }
      }, 24 * 60 * 60 * 1000);
    }
  );
});
