import axios from "axios";
import { EXTERNAL_API_BASE, EXTERNAL_API_VERSION } from "../app";
import { checkAuthentication } from "../../utils/auth";

export const startProcess = async () => {
  console.log("process started for:", Date());
  let multiDeviceDetected = false;
  let page = 1;
  const days = 6;
  const limit = 10;
  let gotEmptyArray = false;
  while (!gotEmptyArray && !multiDeviceDetected) {
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
    } catch (error: any) {
      if (error?.response?.data?.errorCode === "MULTI_DEVICE_LOGIN_DETECTED") {
        multiDeviceDetected = true;
        break;
      } else {
        console.error(error);
        gotEmptyArray = true;
        break;
      }
    }
  }

  if (multiDeviceDetected) {
    console.log(
      "Multi device detected! Now authenticating again for start the process"
    );
    checkAuthentication(multiDeviceDetected)
      .then((_) => console.log("Authentication successfull"))
      .catch((_) =>
        console.log("Authentication error during multi device detection")
      );
  }
};
