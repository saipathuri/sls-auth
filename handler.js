import serverless from "serverless-http";
import app from "./app.js";
const handler = serverless(app);

const _server = async (event, context) => {
  return await handler(event, context);
};

export { _server as server };
