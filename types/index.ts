
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

