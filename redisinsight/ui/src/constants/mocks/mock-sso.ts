export const MOCK_NO_TF_REGION = {
  id: 12148,
  type: 'fixed',
  name: 'Cache 30MB',
  provider: 'AWS',
  price: 0,
  region: 'us-east-2',
  regionId: 4,
  details: {
    id: 4,
    name: 'us-east-2',
    cloud: 'AWS',
    displayOrder: 4,
    countryName: 'Europe',
    cityName: 'Ireland',
    regionId: 4,
    flag: 'ie',
  },
}

export const MOCK_RS_PREVIEW_REGION = {
  id: 12148,
  type: 'fixed',
  name: 'Cache 30MB',
  provider: 'AWS',
  price: 0,
  region: 'us-east-2',
  regionId: 1,
  details: {
    id: 1,
    name: 'us-east-2',
    cloud: 'AWS',
    displayOrder: 1,
    countryName: 'US West',
    cityName: 'Oregon',
    regionId: 1,
    flag: 'ie',
  },
}

export const MOCK_REGIONS = [
  MOCK_NO_TF_REGION,
  {
    id: 12150,
    type: 'fixed',
    name: 'Cache 30MB',
    provider: 'AWS',
    price: 0,
    region: 'ap-southeast-1',
    regionId: 5,
    details: {
      id: 5,
      name: 'ap-southeast-1',
      cloud: 'AWS',
      displayOrder: 7,
      countryName: 'Asia Pacific',
      cityName: 'Singapore',
      regionId: 5,
      flag: 'sg',
    },
  },
  {
    id: 12152,
    type: 'fixed',
    name: 'Cache 30MB',
    provider: 'Azure',
    price: 0,
    region: 'east-us',
    regionId: 16,
    details: {
      id: 16,
      name: 'east-us',
      cloud: 'Azure',
      displayOrder: 10,
      countryName: 'East US',
      cityName: 'Virginia',
      regionId: 16,
      flag: 'us',
    },
  },
  {
    id: 12153,
    type: 'fixed',
    name: 'Cache 30MB',
    provider: 'GCP',
    price: 0,
    region: 'us-central1',
    regionId: 27,
    details: {
      id: 27,
      name: 'us-central1',
      cloud: 'GCP',
      displayOrder: 17,
      countryName: 'North America',
      cityName: 'Iowa',
      regionId: 27,
      flag: 'us',
    },
  },
]

export const MOCK_CUSTOM_REGIONS = [
  {
    id: 12150,
    type: 'fixed',
    name: 'Cache 30MB',
    provider: 'AWS',
    price: 0,
    region: 'custom-1',
    regionId: 11,
    details: {
      id: 11,
      name: 'custom-1',
      cloud: 'AWS',
      displayOrder: 2,
      countryName: 'Asia Pacific',
      cityName: 'Singapore',
      regionId: 11,
      flag: 'sg',
    },
  },
  {
    id: 12152,
    type: 'fixed',
    name: 'Cache 30MB',
    provider: 'Azure',
    price: 0,
    region: 'custom-2',
    regionId: 16,
    details: {
      id: 16,
      name: 'custom-2',
      cloud: 'Azure',
      displayOrder: 10,
      countryName: 'East US',
      cityName: 'Virginia',
      regionId: 16,
      flag: 'us',
    },
  },
  {
    id: 12153,
    type: 'fixed',
    name: 'Cache 30MB',
    provider: 'GCP',
    price: 0,
    region: 'custom-3',
    regionId: 27,
    details: {
      id: 27,
      name: 'custom-3',
      cloud: 'GCP',
      displayOrder: 17,
      countryName: 'North America',
      cityName: 'Iowa',
      regionId: 27,
      flag: 'us',
    },
  },
]
