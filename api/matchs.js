export default async function handler(req, res) {
  try {
    const date =
      req.query.date ||
      new Date().toISOString().split("T")[0];

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${date}&timezone=Europe/Paris`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY
        }
      }
    );

    const data = await response.json();

    if (!response.ok || data.errors?.length) {
      return res.status(500).json({
        error: "Erreur API-Football",
        details: data.errors || {}
      });
    }

    const championnats = [
      { pays: "Paraguay", noms: ["Primera Division", "Division Profesional"] },
      { pays: "Chile", noms: ["Primera Division"] },
      { pays: "China", noms: ["Super League"] },
      { pays: "Colombia", noms: ["Primera A"] },
      { pays: "Latvia", noms: ["Virsliga"] },
      { pays: "Mexico", noms: ["Liga MX"] }
    ];

    const matchs = data.response.filter(match => {
      return championnats.some(championnat => {
        const bonPays =
          match.league.country?.toLowerCase() ===
          championnat.pays.toLowerCase();

        const bonChampionnat = championnat.noms.some(nom =>
          match.league.name
            ?.toLowerCase()
            .includes(nom.toLowerCase())
        );

        return bonPays && bonChampionnat;
      });
    });

    return res.status(200).json({
      date,
      nombre: matchs.length,
      matchs
    });

  } catch (error) {
    return res.status(500).json({
      error: "Impossible de récupérer les matchs",
      message: error.message
    });
  }
}