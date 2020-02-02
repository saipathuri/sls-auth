const USERS_TABLE = process.env.USERS_TABLE;
const INDEX_NAME = process.env.INDEX_NAME;

const isDevEnvironment = () => {
  return process.env.NODE_ENV === "development";
};

export { USERS_TABLE, INDEX_NAME, isDevEnvironment };
