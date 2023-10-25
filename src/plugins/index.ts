import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import { autoRenewGetParamValidator } from "../../validationSchema";
import { autoRenewPackageProcess } from "../controllers";
import axios from "axios";
export default (
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: any
) => {
  fastify.addHook("onRequest", async (request: FastifyRequest, reply) => {
    const clientAccessToken =
      request.headers["x-access-token"] || request.headers["authorization"];
    if (clientAccessToken) {
      axios.defaults.headers["x-access-token"] = clientAccessToken;
    } else return reply.status(401).send({ error: "Access token is missing" });
  });

  fastify.get(
    "/autorenew-package-execute",
    {
      schema: {
        querystring: autoRenewGetParamValidator,
      },
    },
    autoRenewPackageProcess
  );

  done();
};
