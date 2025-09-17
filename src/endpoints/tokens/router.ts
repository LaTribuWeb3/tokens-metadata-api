import { Hono } from "hono";
import { fromHono } from "chanfana";
import { TokenMetadataEndpointByAddress } from "./TokenMetadataEndpointByAddress";
import { TokenMetadataEndpointBySymbol } from "./TokenMetadataEndpointBySymbol";

export const tokensRouter = fromHono(new Hono());

tokensRouter.get("/:network/address/:address", TokenMetadataEndpointByAddress);
tokensRouter.get("/:network/symbol/:symbol", TokenMetadataEndpointBySymbol);
