import { Hono } from "hono";
import { fromHono } from "chanfana";
import { TokenMetadataEndpoint } from "./tokenMetadata";

export const tokensRouter = fromHono(new Hono());

tokensRouter.get("/:network/:address", TokenMetadataEndpoint);
