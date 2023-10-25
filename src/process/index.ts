import axios from "axios";
import { isTokenExpired } from "../../utils/verifyToken";
import { getAuthToken, setAuthToken } from "../../utils/auth";
const EXTERNAL_API_BASE = process.env.EXTERNAL_API_BASE;
const EXTERNAL_API_VERSION = process.env.EXTERNAL_API_VERSION;

export const startProcess = async () => {
  let message: string =
    "Process for " + new Date() + " has been completed successfully";

  //check authentication token if it has been expired or not if expired? then authenticate with the email and password
  // which has been stored in the env.. then the token will be stored in the memory.
  const tokenExpired: boolean = await isTokenExpired(getAuthToken() || "");
  if (tokenExpired) {
    const authenticated = await makeAuthentication();
    if (!authenticated) {
      console.log(
        "Authentication Failed, Check your credentials at environment"
      );
      return;
    }
  }
  // after authentication done start the process
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
    } catch (error: any) {
      console.error(error);
      gotEmptyArray = true;
      message = error.message || "Something went wrong";
      break;
    }
  }

  return message;
};

const makeAuthentication = async () => {
  let authenticated = false;
  try {
    const authPayload = {
      email: process.env.AUTH_EMAIL,
      password: process.env.AUTH_PASSWORD,
    };
    const authResponse = await axios.post(
      `${EXTERNAL_API_BASE}/${EXTERNAL_API_VERSION}/users/auth/password-login`,
      authPayload
    );
    const jwtToken = authResponse?.data?.output?.jwtToken;
    setAuthToken(jwtToken);
    axios.defaults.headers["x-access-token"] = jwtToken;
    authenticated = true;
    return authenticated;
  } catch (error) {
    return authenticated;
  }
};
