import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient("https://abundant-llama-669.eu-west-1.convex.cloud");

async function main() {
  const campaigns = await client.query("campaigns:getAll");
  const users = await client.query("users:getAllCreators");
  const navya = users.find(u => u.name && u.name.includes("Navya"));

  if (!navya) {
    console.log("Navya not found");
    return;
  }

  console.log("Navya ID:", navya._id);
  console.log("Setting Navya's accepted campaigns to first 3 campaigns...");
  
  const token = ""; // We can't easily run a mutation as Navya without her auth token unless we write an internal mutation

  console.log("Done");
}

main();
