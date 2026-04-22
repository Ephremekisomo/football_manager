const pool = require('../config/database');

/**
 * Middleware professionnel pour valider la programmation d'un match
 */
const validateMatchScheduling = async (req, res, next) => {
  const { club_domicile_id, club_exterieur_id, date_match, heure_match } = req.body;
  const matchId = req.params.id; // Utile pour les mises à jour

  try {
    const now = new Date();

    // 0. Vérifier que les deux clubs sont différents
    if (club_domicile_id === club_exterieur_id) {
      return res.status(400).json({
        success: false,
        message: "Un club ne peut pas jouer contre lui-même."
      });
    }

    // Si on ne modifie que le statut (ex: l'arbitre démarre le match), on assouplit la validation de date
    const isStatusOnly = req.method === 'PUT' && req.body.statut && !date_match;

    // 1. Empêcher la programmation dans le passé (sauf mise à jour de statut en direct)
    if (date_match && heure_match && !isStatusOnly) {
      const scheduledDate = new Date(`${date_match} ${heure_match}`);
      if (scheduledDate < now) {
        return res.status(400).json({
          success: false,
          message: "Impossible de programmer un match dans le passé."
        });
      }
    }

    // 2. Vérifier si l'une des deux équipes a déjà un match à ce moment
    // On considère un créneau d'indisponibilité de 3 heures (match + transport/repos)
    const [conflicts] = await pool.query(`
      SELECT id, date_match, heure_match 
      FROM matchs 
      WHERE date_match = ? 
      AND (club_domicile_id IN (?, ?) OR club_exterieur_id IN (?, ?))
      AND id != ?
      AND ABS(TIMESTAMPDIFF(MINUTE, heure_match, ?)) < 180
    `, [
      date_match, 
      club_domicile_id, club_exterieur_id, 
      club_domicile_id, club_exterieur_id,
      matchId || 0,
      heure_match
    ]);

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Conflit d'horaire : l'une des équipes joue déjà un match dans un créneau proche de cette heure."
      });
    }

    next();
  } catch (error) {
    console.error('Erreur validation match:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la vérification de la disponibilité des équipes." 
    });
  }
};

module.exports = { validateMatchScheduling };