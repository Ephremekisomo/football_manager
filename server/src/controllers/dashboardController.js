const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const stats = {};

    // Total clubs (actifs)
    const [clubsResult] = await pool.query('SELECT COUNT(*) as count FROM clubs WHERE statut = "actif"');
    stats.total_clubs = parseInt(clubsResult[0].count);

    // Total joueurs (actifs)
    const [joueursResult] = await pool.query('SELECT COUNT(*) as count FROM joueurs WHERE statut = "actif"');
    stats.total_joueurs = parseInt(joueursResult[0].count);

    // Total competitions (actives)
    const [competitionsResult] = await pool.query('SELECT COUNT(*) as count FROM competitions WHERE statut = "active"');
    stats.total_competitions_actives = parseInt(competitionsResult[0].count);

    // Total matchs (programmés + en cours)
    const [matchsProgResult] = await pool.query('SELECT COUNT(*) as count FROM matchs WHERE statut IN ("programme", "en_cours")');
    stats.matchs_a_venir = parseInt(matchsProgResult[0].count);

    // Total matchs totaux
    const [matchsTotalResult] = await pool.query('SELECT COUNT(*) as count FROM matchs');
    stats.total_matchs = parseInt(matchsTotalResult[0].count);

    // Total arbitres
    const [arbitresResult] = await pool.query('SELECT COUNT(*) as count FROM arbitres');
    stats.total_arbitres = parseInt(arbitresResult[0].count);

    // Total résultats
    const [resultatsResult] = await pool.query('SELECT COUNT(*) as count FROM resultats');
    stats.total_resultats = parseInt(resultatsResult[0].count);

    // Total trophées attribués
    const [tropheesResult] = await pool.query('SELECT COUNT(*) as count FROM trophees');
    stats.total_trophees = parseInt(tropheesResult[0].count);

    // Utilisateurs par rôle
    const [rolesResult] = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE is_active = 1 
      GROUP BY role
    `);
    stats.utilisateurs_par_role = rolesResult;

    // Compétitions par statut
    const [compStatutResult] = await pool.query(`
      SELECT statut, COUNT(*) as count 
      FROM competitions 
      GROUP BY statut
    `);
    stats.competitions_par_statut = compStatutResult;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getDashboardStats };
