import { normalizeStructTag } from "@mysten/sui/utils";
import { IPartnerFee } from "../../types";
import { BigNumb } from "../../BigNumber";

export const getFeeInfoUrl = (
  coinInType: string,
  coinOutType: string,
  partnerFee?: IPartnerFee
) => {
  let feeToken = "",
    feeAmount = "",
    feeInBps = "",
    commissionOnInput = true,
    url = "";
  if (!partnerFee) return { url: "", feeToken, feeAmount, feeInBps };
  const { tokensType, fixAmount, percentage, commissionType } = partnerFee;
  const listToken = tokensType.map((i) => normalizeStructTag(i));
  // console.log("commissionOnInput", coinInType, coinOutType);
  if (fixAmount && !percentage) {
    feeAmount = fixAmount;
  }
  if (!fixAmount && percentage && +percentage > 0) {
    feeInBps = BigNumb(partnerFee.percentage)
      .div(100)
      .multipliedBy(10000)
      .toFixed();
  }
  if (commissionType === "input") {
    feeToken = normalizeStructTag(coinInType);
  }
  if (commissionType === "output") {
    feeToken = normalizeStructTag(coinOutType);
    commissionOnInput = false;
  }

  if (commissionType === "tokensType") {
    if (listToken.includes(normalizeStructTag(coinInType))) {
      feeToken = normalizeStructTag(coinInType);
    } else {
      if (listToken.includes(normalizeStructTag(coinOutType))) {
        feeToken = normalizeStructTag(coinOutType);
        commissionOnInput = false;
      }
    }
  }
  // console.log("feeToken", feeToken, commissionOnInput);
  url =
    feeToken.length > 0
      ? `&feeToken=${feeToken}${
          feeAmount.length > 0 ? `&feeAmount=${feeAmount}` : ""
        }${feeInBps.length > 0 ? `&feeInBps=${feeInBps}` : ""}`
      : "";
  if (
    commissionType === "tokensType" &&
    !listToken.includes(normalizeStructTag(coinInType)) &&
    !listToken.includes(normalizeStructTag(coinOutType))
  ) {
    url = "";
  }
  return {
    url,
    commissionOnInput,
  };
};
