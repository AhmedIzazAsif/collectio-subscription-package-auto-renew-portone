export const autoRenewGetParamValidator = {
  type: "object",
  properties: {
    limit: {
      type: "number",
    },
    days: {
      type: "number",
    },
    page: {
      type: "number",
    },
    subscriptionPackageId: {
      type: "number",
    },
    details: {
      type: "string",
    },
    direction: {
      type: "string",
    },
  },
  required: ["limit", "days", "page"],
};
