import { IPriceDocument } from "../../modules/Price/price.model";
import { IProductDocument } from "../../modules/Product/product.model";
import { IPaginationData, IPriceCalculationResult } from "../types/utils";
import axios from "axios";

interface INominatimResponse {
  display_name: string;
  address?: {
    village?: string;
    city?: string;
    town?: string;
    district?: string;
    county?: string;
    state?: string;
  };
}

interface IApiRes {
  display_name: string;
  village?: string;
  city?: string;
  district?: string;
  county?: string;
  state?: string;
}

//! I don’t have internet, so this method definitely won’t work — 63 days without internet.
const getLocationDetails = async (
  lat: number,
  lng: number,
): Promise<IApiRes> => {
  const url = `https://nominatim.openstreetmap.org/reverse`;

  const response = await axios.get<INominatimResponse>(url, {
    params: {
      format: "json",
      lat,
      lon: lng,
      "accept-language": "fa",
    },
    headers: {
      "User-Agent": "my-app",
    },
  });

  const data = response.data;

  return {
    display_name: data.display_name,
    village: data.address?.village,
    city: data.address?.city ?? data.address?.town,
    district: data.address?.district,
    county: data.address?.county,
    state: data.address?.state,
  };
};

const isLocationInIran = (lat: number, lng: number): boolean => {
  const iranBounds = {
    latMin: 25.0,
    latMax: 39.5,
    lngMin: 44.0,
    lngMax: 63.5,
  };

  return (
    lat >= iranBounds.latMin &&
    lat <= iranBounds.latMax &&
    lng >= iranBounds.lngMin &&
    lng <= iranBounds.lngMax
  );
};

const createPaginationData = (
  page: number,
  limit: number,
  totalCount: number,
  resource: string,
): IPaginationData => {
  return {
    page,
    limit,
    totalPage: Math.ceil(totalCount / limit),
    ["total" + resource]: totalCount,
  };
};

const getTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}sec ago`;
  }

  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}sec`);

  return parts.join(" ") + " ago";
};

const calculateProductPrice = (
  product: IProductDocument,
  prices: IPriceDocument,
): IPriceCalculationResult => {

  let rawPrice = 0;
  let details: IPriceCalculationResult["details"] = { basePrice: 0, profit: 0 };

  switch (product.type) {
    case "JEWELRY": {
      const rawGold = prices.gold18k;
      const weight = product.weight || 0;

      let wagePerGram = 0;
      if (product.wageType === "PERCENT") {
        wagePerGram = rawGold * ((product.wage || 0) / 100);
      } else if (product.wageType === "FIXED") {
        wagePerGram = product.wage || 0;
      }

      const profitMargin = product.profitMargin || 0;
      const profitPerGram = (rawGold + wagePerGram) * (profitMargin / 100);

      const taxRate = product.taxRate || 0;
      const taxableAmount = wagePerGram + profitPerGram;
      const taxPerGram = taxableAmount * (taxRate / 100);

      const pricePerGram = rawGold + wagePerGram + profitPerGram + taxPerGram;
      rawPrice = pricePerGram * weight;

      details = {
        basePrice: rawGold * weight,
        wage: Math.round(wagePerGram * weight / 1000) * 1000,
        profit: Math.round(profitPerGram * weight / 1000) * 1000,
        tax: Math.round(taxPerGram * weight / 1000) * 1000,
        weight: weight,
      };
      break;
    }

    case "COIN": {
      let baseCoinPrice = 0;

      switch (product.coinType) {
        case "EMAMI":
          baseCoinPrice = prices.coinEmami;
          break;
        case "BAHAR_AZADI":
          baseCoinPrice = prices.coinFull;
          break;
        case "HALF":
          baseCoinPrice = prices.coinHalf;
          break;
        case "QUARTER":
          baseCoinPrice = prices.coinQuarter;
          break;
        // case "GRAM":
        // TODO
        //   baseCoinPrice = 0;
        //  break;
      }

      const coinProfitValue = product.coinProfit || 0;
      let coinProfit = 0;

      if (product.coinProfitType === "PERCENT") {
        coinProfit = baseCoinPrice * (coinProfitValue / 100);
      } else if (product.coinProfitType === "FIXED") {
        coinProfit = coinProfitValue;
      }

      rawPrice = baseCoinPrice + coinProfit;

      details = {
        basePrice: baseCoinPrice,
        profit: coinProfit,
      };
      break;
    }
  }

  const exactRawPrice = Math.round(rawPrice);

  const roundedMarketPrice = Math.round(exactRawPrice / 1000) * 1000;

  return {
    rawPrice: exactRawPrice,
    roundedPrice: roundedMarketPrice,
    details: details,
  };
};

export {
  createPaginationData,
  getLocationDetails,
  isLocationInIran,
  getTimeAgo,
  calculateProductPrice,
};
