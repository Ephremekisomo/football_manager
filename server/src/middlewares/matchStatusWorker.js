const pool = require('../config/database');

/**
 * Met à jour automatiquement les matchs dont l'heure de début + 60 min est passée
 */
const autoTerminateMatches = async () => {
  try {
    // Sélectionne les matchs 'programmes' commencés il y a plus de 60 minutes
    const query = `
      UPDATE matchs 
      SET statut = 'termine' 
      WHERE statut = 'programme' 
      AND TIMESTAMP(date_match, heure_match) <= (NOW() - INTERVAL 60 MINUTE)
    `;

    const [result] = await pool.query(query);
    
    if (result.affectedRows > 0) {
      console.log(`[WORKER] Statut mis à jour pour ${result.affectedRows} match(s).`);
    }
  } catch (error) {
    console.error('[WORKER ERROR] Échec de la mise à jour automatique des matchs:', error);
  }
};

// Exécution immédiate si lancé directement via node
if (require.main === module) {
  autoTerminateMatches().then(() => process.exit(0));
}

module.exports = { autoTerminateMatches };