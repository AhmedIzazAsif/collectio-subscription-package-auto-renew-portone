import { FastifyRequest, FastifyReply } from "fastify";
import { IGetRenewlistParams } from "../../types";
import {
  autoRenewPayment,
  getAutoRenewPackageData,
} from "../implementations/autoRenewPackageProcess";

export const autoRenewPackageProcess = async (
  req: FastifyRequest<{
    Querystring: IGetRenewlistParams;
  }>,
  res: FastifyReply
) => {
  const resBody = {
    message: "Success",
    errorCode: "none",
    httpStatus: 200,
    output: {},
  };
  const {
    page = 1,
    limit = 10,
    days = 2,
    subscriptionPackageId,
    details = "no",
    direction,
  } = req.query;
  try {
    const { payloadList, message } = await getAutoRenewPackageData({
      limit,
      days,
      page,
      subscriptionPackageId,
      details,
      direction,
    });

    if (message !== "success") {
      resBody.message = message;
      return res.code(resBody.httpStatus).send(resBody);
    }
    const results = await autoRenewPayment(payloadList);
    resBody.output = results;
    return res.code(resBody.httpStatus).send(resBody);
  } catch (error) {
    return res.code(resBody.httpStatus).send(resBody);
  }
};
