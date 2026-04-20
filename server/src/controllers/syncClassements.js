const pool = require('../config/database');
require('dotenv').config();

const syncClassementUtils = {
  /**
   * Synchronise le classement d'une compétition spécifique
   */
  syncCompetition: async (competitionId) => {
    // 1. Récupérer les infos de la compétition
    const [comps] = await pool.query('SELECT id, nom_competition, saison FROM competitions WHERE id = ?', [competitionId]);
    if (comps.length === 0) return;
    const comp = comps[0];

    // 2. Calculer les statistiques par club pour cette compétition
    const query = `
      SELECT 
        c.id as club_id,
        c.nom_club as equipe,
        COUNT(r.id) as matchs_joues,
        SUM(CASE 
          WHEN (r.buts_domicile > r.buts_exterieur AND m.club_domicile_id = c.id) OR 
               (r.buts_domicile < r.buts_exterieur AND m.club_exterieur_id = c.id) 
          THEN 1 ELSE 0 END) as victoires,
        SUM(CASE 
          WHEN r.buts_domicile = r.buts_exterieur AND 
               ((m.club_domicile_id = c.id) OR (m.club_exterieur_id = c.id))
          THEN 1 ELSE 0 END) as nuls,
        SUM(CASE 
          WHEN (r.buts_domicile < r.buts_exterieur AND m.club_domicile_id = c.id) OR 
               (r.buts_domicile > r.buts_exterieur AND m.club_exterieur_id = c.id) 
          THEN 1 ELSE 0 END) as defaites,
        COALESCE(SUM(CASE 
          WHEN m.club_domicile_id = c.id THEN r.buts_domicile 
          WHEN m.club_exterieur_id = c.id THEN r.buts_exterieur 
          ELSE 0 END), 0) as buts_pour,
        COALESCE(SUM(CASE 
          WHEN m.club_domicile_id = c.id THEN r.buts_exterieur 
          WHEN m.club_exterieur_id = c.id THEN r.buts_domicile 
          ELSE 0 END), 0) as buts_contre,
        (SUM(CASE 
          WHEN (r.buts_domicile > r.buts_exterieur AND m.club_domicile_id = c.id) OR 
               (r.buts_domicile < r.buts_exterieur AND m.club_exterieur_id = c.id) 
          THEN 3 ELSE 0 END) + SUM(CASE 
          WHEN r.buts_domicile = r.buts_exterieur AND 
               ((m.club_domicile_id = c.id) OR (m.club_exterieur_id = c.id))
          THEN 1 ELSE 0 END)) as points
      FROM clubs c
      INNER JOIN participations p ON p.club_id = c.id
      LEFT JOIN matchs m ON (m.club_domicile_id = c.id OR m.club_exterieur_id = c.id) AND m.competition_id = ?
      LEFT JOIN resultats r ON r.match_id = m.id AND r.validation_officielle = true
      WHERE p.competition_id = ? AND p.statut_validation = 'valide'
      GROUP BY c.id, c.nom_club
    `;

    const [standings] = await pool.query(query, [competitionId, competitionId]);

    // 3. Upsert dans la table classements
    for (const row of standings) {
      // Calcul de la forme (5 derniers matchs)
      const [lastResults] = await pool.query(`
        SELECT r.buts_domicile, r.buts_exterieur, m.club_domicile_id
        FROM resultats r
        JOIN matchs m ON r.match_id = m.id
        WHERE (m.club_domicile_id = ? OR m.club_exterieur_id = ?) 
          AND m.competition_id = ? 
          AND r.validation_officielle = true
        ORDER BY m.date_match DESC, m.heure_match DESC
        LIMIT 5
      `, [row.club_id, row.club_id, competitionId]);

      const forme = lastResults.map(res => {
        const isDom = res.club_domicile_id === row.club_id;
        const myButs = isDom ? res.buts_domicile : res.buts_exterieur;
        const oppButs = isDom ? res.buts_exterieur : res.buts_domicile;
        if (myButs > oppButs) return 'V';
        if (myButs === oppButs) return 'N';
        return 'D';
      }).reverse().join('');

      const diff_buts = (row.buts_pour || 0) - (row.buts_contre || 0);
      await pool.query(`
        INSERT INTO classements 
          (competition_id, club_id, equipe, saison, matchs_joues, victoires, nuls, defaites, buts_pour, buts_contre, diff_buts, points, forme)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          matchs_joues = VALUES(matchs_joues),
          victoires = VALUES(victoires),
          nuls = VALUES(nuls),
          defaites = VALUES(defaites),
          buts_pour = VALUES(buts_pour),
          buts_contre = VALUES(buts_contre),
          diff_buts = VALUES(diff_buts),
          points = VALUES(points),
          forme = VALUES(forme),
          updated_at = CURRENT_TIMESTAMP
      `, [
        competitionId, row.club_id, row.equipe, comp.saison, row.matchs_joues || 0, 
        row.victoires || 0, row.nuls || 0, row.defaites || 0, row.buts_pour || 0, 
        row.buts_contre || 0, diff_buts, row.points || 0, forme
      ]);
    }
  },

  /**
   * Synchronise toutes les compétitions
   */
  syncAllClassements: async () => {
    try {
      console.log('--- Démarrage de la synchronisation globale ---');
      const [competitions] = await pool.query('SELECT id FROM competitions');
      for (const comp of competitions) {
        await syncClassementUtils.syncCompetition(comp.id);
      }
      console.log('--- Synchronisation terminée ---');
    } catch (error) {
      console.error('Erreur synchronisation globale :', error);
      throw error;
    }
  }
};

// Exécution directe (CLI)
if (require.main === module) {
  syncClassementUtils.syncAllClassements()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = syncClassementUtils;