import "dotenv/config";
import fastify from "fastify";
import fastifyRequestContext from "@fastify/request-context";
import fastifyFormbody from "@fastify/formbody";
import Ajv from "ajv";
import { startProcess } from "./process";

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
      // starting the process for every day
      setInterval(() => {
        startProcess()
          .then((message) => console.log(message))
          .catch((error) => console.log(error));
      }, 24 * 60 * 60 * 1000);
    }
  );
});
