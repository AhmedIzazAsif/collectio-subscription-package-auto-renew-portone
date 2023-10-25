import axios from "axios";
import { IGetRenewlistParams, ISubscriptionItem } from "../../types";
const EXTERNAL_API_BASE = process.env.EXTERNAL_API_BASE;
const EXTERNAL_API_VERSION = process.env.EXTERNAL_API_VERSION;
export const getAutoRenewPackageData = async ({
  limit,
  days,
  page,
  subscriptionPackageId,
  details,
  direction,
}: IGetRenewlistParams) => {
  let returnValue = {
    message: "success",
    payloadList: [],
  };

  try {
    const response = await axios.get(
      `${EXTERNAL_API_BASE}/${EXTERNAL_API_VERSION}/cms/subscription/auto-renew/portone?limit=${limit}&days=${days}&page=${page}${
        subscriptionPackageId
          ? `&subscriptionPackageId=${subscriptionPackageId}`
          : ""
      }${details ? `&details=${details}` : ""}${
        direction ? `&details=${details}` : ""
      }`
    );

    const data = response.data;
    if (data?.status !== "success") {
      returnValue.message = data?.status;
      return returnValue;
    }
    if (data?.output?.data.length <= 0) {
      returnValue.message = "No Data Found";
      return returnValue;
    }

    returnValue.payloadList = data?.output?.data?.map(
      (item: ISubscriptionItem) => ({
        userId: item?.userId,
        subscriptionRequestId: item?.subscriptionRequestId,
        subscriptionPackageId: item?.subscriptionPackageId,
      })
    );
    return returnValue;
  } catch (error: any) {
    returnValue.message = "Something went wrong";
    return returnValue;
  }
};

export const autoRenewPayment = async (payloadList: ISubscriptionItem[]) => {
  const results = await Promise.all(
    payloadList.map(async (subscription) => {
      try {
        const url = `${EXTERNAL_API_BASE}/${EXTERNAL_API_VERSION}/cms/subscription/auto-renew/portone/single`;
        const response = await axios.post(url, subscription);
        return {
          userId: subscription.userId,
          subscriptionPackageId: subscription?.subscriptionPackageId,
          ...response.data,
        };
      } catch (error: any) {
        console.error(`API call failed for item:`, subscription);
        console.error("Error:", error);
        return { status: "error", message: error?.message };
      }
    })
  );
  return results;
};
