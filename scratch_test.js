

async function run() {
  try {
    const url = 'https://api.football-data.org/v4/competitions/WC/matches?dateFrom=2026-06-18&dateTo=2026-06-18';
    const response = await fetch(url, {
      headers: { 'X-Auth-Token': 'ab9003676f6045b6b0c68c495bab174a' }
    });
    const data = await response.json();
    console.log('API Matches for Today:');
    for (const m of data.matches || []) {
      console.log(`${m.homeTeam.name} vs ${m.awayTeam.name}: status=${m.status}, kickoff=${m.utcDate}, score=${m.score.fullTime.home}:${m.score.fullTime.away}`);
    }
  } catch (err) {
    console.error(err);
  }
}

run();
