import fs from "fs/promises";

(async () => {
  const data = await fs.readFile("./games-db-raw.txt", "utf8");
  const games = data.split(/\s*\n{2,}/);

  const cleanedGames = games.map((g) => {
    const cleanedNotation = g
      .replace(/\d+\./g, "")
      .replace(/\s*(1-0|0-1|1\/2-1\/2)\s*$/, "")
      .replaceAll("+", "")
      .trim();

    return cleanedNotation.split(/[\s\n]+/);
  });

  await fs.writeFile("./games-db.json", JSON.stringify(cleanedGames), "utf-8");
})();
