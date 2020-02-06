const {
  USERS_TABLE,
  USERS_INDEX_NAME,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET
} = process.env;

const isDevEnvironment = () => {
  return process.env.NODE_ENV === "development";
};

export {
  USERS_TABLE,
  USERS_INDEX_NAME,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  isDevEnvironment
};
