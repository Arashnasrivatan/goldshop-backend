import { IPaginationData } from "../types/utils";
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

export { createPaginationData, getLocationDetails, isLocationInIran };
