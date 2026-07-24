import { ConvexHttpClient } from "convex/browser";
const client = new ConvexHttpClient("https://careful-chipmunk-772.convex.cloud");
async function run() {
  const campaigns = await client.query("campaigns:getActive" as any);
  console.log(campaigns.map(c => ({ title: c.title, lat: c.centerLat, lng: c.centerLng, loc: c.centerLocality })));
}
run();
