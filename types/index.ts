export interface IGetRenewlistParams {
  limit: number;
  days: number;
  page: number;
  subscriptionPackageId?: number;
  details?: string;
  direction?: string;
}

export interface ISubscriptionItem {
  userId: string;
  subscriptionRequestId: string;
  subscriptionPackageId: number;
  nextPaymentDate: string;
  subscriptionStatus: string;
}

export interface ISingleSubscription {
  userId: string;
  subscriptionRequestId: string;
  subscriptionPackageId: number;
}

export interface IResponse {
  status: string;
  message?: string;
  errorCode?: string;
  httpStatus: number;
  output?: any;
}
