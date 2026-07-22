import { getEnabledCatalog } from "../src/lib/catalog/products";
import { buildCardmarketUrl, cardmarketScraper } from "../src/lib/scrapers/cardmarket";
import { catalogToQuery } from "../src/lib/scrapers/orchestrator";

async function main() {
  const product = getEnabledCatalog().find(
    (p) => p.id === "graded-jp-charizard-151"
  );
  if (!product) throw new Error("Prodotto non trovato");

  const query = catalogToQuery(product, 10);
  console.log("URL:", buildCardmarketUrl(query));
  console.log("Query:", query);

  const result = await cardmarketScraper.scrape(query);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
