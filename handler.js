import serverless from "serverless-http";
import server from "./app.js";
const handler = serverless(server);

const _server = async (event, context) => {
  return await handler(event, context);
};

export { _server as server };
