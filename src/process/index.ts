import axios from "axios";
axios.defaults.headers["x-access-token"] = process.env.API_KEY || "";
const EXTERNAL_API_BASE = process.env.EXTERNAL_API_BASE;
const EXTERNAL_API_VERSION = process.env.EXTERNAL_API_VERSION;

export const startProcess = async () => {
  console.log("process started for:", Date());
  let page = 1;
  const days = 6;
  const limit = 10;
  let gotEmptyArray = false;

  while (!gotEmptyArray) {
    try {
      const response = await axios.get(
        `${EXTERNAL_API_BASE}/${EXTERNAL_API_VERSION}/cms/subscription/auto-renew/portone?limit=${limit}&days=${days}&page=${page}`
      );

      const data = response.data?.output?.data;
      if (!data || data?.length <= 0) {
        console.log("Got empty array");
        gotEmptyArray = true;
        break;
      }
      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        const subscription = {
          userId: item?.userId,
          subscriptionRequestId: item?.subscriptionRequestId,
          subscriptionPackageId: item?.subscriptionPackageId,
        };

        const url = `${EXTERNAL_API_BASE}/${EXTERNAL_API_VERSION}/cms/subscription/auto-renew/portone/single`;
        try {
          await axios.post(url, subscription);
        } catch (err) {
          console.log("Error occurred during processing for == ", subscription);
        }
      }
      page++;
    } catch (error) {
      console.error(error);
      gotEmptyArray = true;
      break;
    }
  }

  return "Process for " + new Date() + " has been completed successfully";
};
