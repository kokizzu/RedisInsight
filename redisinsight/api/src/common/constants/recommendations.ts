export enum SearchVisualizationCommands {
  FT_INFO = "FT.INFO",
  FT_SEARCH = "FT.SEARCH",
  FT_AGGREGATE = "FT.AGGREGATE",
  FT_PROFILE = "FT.PROFILE",
  FT_EXPLAIN = "FT.EXPLAIN",
  TS_RANGE = "TS.RANGE",
  TS_MRANGE = "TS.MRANGE",
}

export const LUA_SCRIPT_RECOMMENDATION_COUNT = 10;
export const BIG_HASHES_RECOMMENDATION_LENGTH = 5000;
export const COMBINE_SMALL_STRINGS_TO_HASHES_RECOMMENDATION_MEMORY = 200;
export const USE_SMALLER_KEYS_RECOMMENDATION_TOTAL = 1_000_000;
export const COMPRESS_HASH_FIELD_NAMES_RECOMMENDATION_LENGTH = 1000;
export const COMPRESSION_FOR_LIST_RECOMMENDATION_LENGTH = 1000;
export const BIG_SETS_RECOMMENDATION_LENGTH = 1_000;
export const BIG_AMOUNT_OF_CONNECTED_CLIENTS_RECOMMENDATION_CLIENTS = 100;
export const BIG_STRINGS_RECOMMENDATION_MEMORY = 100_000;
export const RTS_RECOMMENDATION_PERCENTAGE = 99;
export const SEARCH_INDEXES_RECOMMENDATION_KEYS_FOR_CHECK = 100;
export const REDIS_VERSION_RECOMMENDATION_VERSION = '6';
export const COMBINE_SMALL_STRINGS_TO_HASHES_RECOMMENDATION_KEYS_COUNT = 10;
export const SEARCH_HASH_RECOMMENDATION_KEYS_FOR_CHECK = 50;
export const SEARCH_HASH_RECOMMENDATION_KEYS_LENGTH = 2;
