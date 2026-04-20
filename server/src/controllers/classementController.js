const pool = require('../config/database');

const getClassement = async (req, res) => {
  try {
    const { competition_id, saison } = req.query;
    
    if (!competition_id) {
      return res.status(400).json({ success: false, message: 'competition_id requis' });
    }

    const compId = parseInt(competition_id);

    // On privilégie la table physique classements
    let [standings] = await pool.query(`
      SELECT * FROM classements 
      WHERE competition_id = ? AND saison = ?
      ORDER BY points DESC, diff_buts DESC, buts_pour DESC
    `, [compId, saison]);

    // Fallback : Si la table est vide, on calcule dynamiquement (utile pour le premier lancement)
    if (standings.length === 0) {
      const queryFallback = `
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
          (SUM(IF(m.club_domicile_id = c.id, r.buts_domicile, r.buts_exterieur)) - 
           SUM(IF(m.club_domicile_id = c.id, r.buts_exterieur, r.buts_domicile))) as diff_buts,
          (SUM(CASE 
            WHEN (r.buts_domicile > r.buts_exterieur AND m.club_domicile_id = c.id) OR 
                 (r.buts_domicile < r.buts_exterieur AND m.club_exterieur_id = c.id) 
            THEN 3 ELSE 0 END) + SUM(CASE 
            WHEN r.buts_domicile = r.buts_exterieur AND 
                 ((m.club_domicile_id = c.id) OR (m.club_exterieur_id = c.id))
            THEN 1 ELSE 0 END)) as points
        FROM clubs c
        INNER JOIN participations p ON p.club_id = c.id
        INNER JOIN competitions comp ON p.competition_id = comp.id
        LEFT JOIN matchs m ON (m.club_domicile_id = c.id OR m.club_exterieur_id = c.id) AND m.competition_id = ?
        LEFT JOIN resultats r ON r.match_id = m.id AND r.validation_officielle = true
        WHERE p.competition_id = ? AND p.statut_validation = 'valide' AND comp.saison = ?
        GROUP BY c.id, c.nom_club
        ORDER BY points DESC, diff_buts DESC, buts_pour DESC
      `;
      const [results] = await pool.query(queryFallback, [compId, compId, saison]);
      standings = results;
    }

    // Récupérer la liste des saisons disponibles pour le filtre
    const [saisonsRows] = await pool.query(
      'SELECT DISTINCT saison FROM competitions ORDER BY saison DESC'
    );
    const saisons = saisonsRows.map(r => r.saison);

    // Ajout position
    standings.forEach((row, index) => {
      const isTop = index < 3;
      const isBottom = index >= standings.length - 3 && index >= 3; // Évite l'overlap

      row.position = index + 1;
      row.color = isTop ? 'bg-green-50 border-green-200 text-green-900' : 
                  isBottom ? 'bg-red-50 border-red-200 text-red-900' : 
                  'bg-white border-slate-200 text-slate-900';
    });

    res.json({
      success: true,
      data: standings,
      saisons: saisons.length > 0 ? saisons : ['2026-2027', '2025-2026']
    });

  } catch (error) {
    console.error('Classement error:', error);
    res.status(500).json({ success: false, message: 'Erreur calcul classement' });
  }
};

module.exports = { 
  getClassement 
};
