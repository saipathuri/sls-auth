import serverless from "serverless-http";
import app from "./App";
const handler = serverless(app);

const _server = async (event: AWSLambda.APIGatewayProxyEvent, context: AWSLambda.Context) => {
  return await handler(event, context);
};

export { _server as server };
