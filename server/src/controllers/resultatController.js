const pool = require('../config/database');
const syncClassementUtils = require('./syncClassements');

const getAllResultats = async (req, res) => {
  try {
    const { page = 1, limit = 10, competition_id = '', match_id = '', validation_officielle = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, m.date_match, m.heure_match, m.stade,
             cd.nom_club as club_domicile_nom, ce.nom_club as club_exterieur_nom,
             comp.nom_competition
      FROM resultats r
      LEFT JOIN matchs m ON r.match_id = m.id
      LEFT JOIN clubs cd ON m.club_domicile_id = cd.id
      LEFT JOIN clubs ce ON m.club_exterieur_id = ce.id
      LEFT JOIN competitions comp ON m.competition_id = comp.id
      WHERE 1=1
    `;
    const params = [];

    if (competition_id) {
      query += ' AND m.competition_id = ?';
      params.push(competition_id);
    }

    if (match_id) {
      query += ' AND r.match_id = ?';
      params.push(match_id);
    }

    if (validation_officielle !== '') {
      query += ' AND r.validation_officielle = ?';
      params.push(validation_officielle === 'true');
    }

    const countQuery = query.replace(/SELECT r\.\*,.*?comp\.nom_competition/g, 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = parseInt(countResult.total);

    query += ' ORDER BY m.date_match DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [result] = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        resultats: result,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting resultats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const getResultatById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `SELECT r.*, m.date_match, m.heure_match, m.stade,
              cd.nom_club as club_domicile_nom, ce.nom_club as club_exterieur_nom,
              comp.nom_competition
       FROM resultats r
       LEFT JOIN matchs m ON r.match_id = m.id
       LEFT JOIN clubs cd ON m.club_domicile_id = cd.id
       LEFT JOIN clubs ce ON m.club_exterieur_id = ce.id
       LEFT JOIN competitions comp ON m.competition_id = comp.id
       WHERE r.id = ?`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Résultat non trouvé' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error getting resultat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const getResultatByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const [result] = await pool.query(
      `SELECT r.*, m.date_match, m.heure_match, m.stade,
              cd.nom_club as club_domicile_nom, ce.nom_club as club_exterieur_nom,
              comp.nom_competition
       FROM resultats r
       LEFT JOIN matchs m ON r.match_id = m.id
       LEFT JOIN clubs cd ON m.club_domicile_id = cd.id
       LEFT JOIN clubs ce ON m.club_exterieur_id = ce.id
       LEFT JOIN competitions comp ON m.competition_id = comp.id
       WHERE r.match_id = ?`,
      [matchId]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucun résultat pour ce match' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error getting resultat by match:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const createResultat = async (req, res) => {
  try {
    const { match_id, buts_domicile, buts_exterieur, observations, validation_officielle, buteurs } = req.body;

    if (!match_id) {
      return res.status(400).json({ success: false, message: 'Match requis' });
    }

    const [checkMatch] = await pool.query('SELECT id FROM matchs WHERE id = ?', [match_id]);
    if (checkMatch.length === 0) {
      return res.status(400).json({ success: false, message: 'Match non trouvé' });
    }

    const [checkExisting] = await pool.query('SELECT id FROM resultats WHERE match_id = ?', [match_id]);
    if (checkExisting.length > 0) {
      return res.status(400).json({ success: false, message: 'Un résultat existe déjà pour ce match' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [resInsert] = await connection.query(
        'INSERT INTO resultats (match_id, buts_domicile, buts_exterieur, observations, validation_officielle) VALUES (?, ?, ?, ?, ?)',
        [match_id, buts_domicile || 0, buts_exterieur || 0, observations, validation_officielle || false]
      );
      
      await connection.query('UPDATE matchs SET statut = ? WHERE id = ?', ['termine', match_id]);
      
      // Insertion des buteurs dans la même transaction
      if (buteurs && buteurs.length > 0) {
        const values = buteurs.map(b => [match_id, b.joueur_id, b.nb_buts]);
        await connection.query(
          'INSERT INTO match_buteurs (match_id, joueur_id, nb_buts) VALUES ?',
          [values]
        );
      }

      await connection.commit();
      res.status(201).json({ success: true, data: { id: resInsert.insertId, match_id } });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating resultat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const updateResultat = async (req, res) => {
  try {
    const { id } = req.params;
    const { buts_domicile, buts_exterieur, observations, validation_officielle, buteurs } = req.body;

    const [existing] = await pool.query('SELECT * FROM resultats WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Résultat non trouvé' });
    }

    let updateFields = [];
    let updateValues = [];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (buts_domicile !== undefined) { updateFields.push('buts_domicile = ?'); updateValues.push(buts_domicile); }
      if (buts_exterieur !== undefined) { updateFields.push('buts_exterieur = ?'); updateValues.push(buts_exterieur); }
      if (observations !== undefined) { updateFields.push('observations = ?'); updateValues.push(observations); }
      if (validation_officielle !== undefined) { updateFields.push('validation_officielle = ?'); updateValues.push(validation_officielle); }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await connection.query(`UPDATE resultats SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
      }

      // Mise à jour des buteurs si fournis
      if (buteurs !== undefined) {
        const matchId = existing[0].match_id;
        await connection.query('DELETE FROM match_buteurs WHERE match_id = ?', [matchId]);
        
        if (buteurs.length > 0) {
          const values = buteurs.map(b => [matchId, b.joueur_id, b.nb_buts]);
          await connection.query('INSERT INTO match_buteurs (match_id, joueur_id, nb_buts) VALUES ?', [values]);
        }
      }

      await connection.commit();

      // Synchronisation du classement (post-transaction)
      const needsSync = (buts_domicile !== undefined || buts_exterieur !== undefined || validation_officielle !== undefined) && 
                       (existing[0].validation_officielle || validation_officielle === true);

      if (needsSync) {
        const [match] = await pool.query('SELECT competition_id FROM matchs WHERE id = ?', [existing[0].match_id]);
        if (match.length > 0) await syncClassementUtils.syncCompetition(match[0].competition_id);
      }

      const [result] = await pool.query('SELECT * FROM resultats WHERE id = ?', [id]);
      res.json({ success: true, data: result[0] });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating resultat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const validateResultat = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM resultats WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Résultat non trouvé' });
    }

    await pool.query('UPDATE resultats SET validation_officielle = ? WHERE id = ?', [true, id]);

    // Mettre à jour le classement de la compétition concernée
    const [match] = await pool.query('SELECT competition_id FROM matchs WHERE id = ?', [existing[0].match_id]);
    if (match.length > 0) {
      await syncClassementUtils.syncCompetition(match[0].competition_id);
    }

    const [result] = await pool.query('SELECT * FROM resultats WHERE id = ?', [id]);

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error validating resultat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const deleteResultat = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [resultat] = await pool.query('SELECT match_id, validation_officielle FROM resultats WHERE id = ?', [id]);
    if (resultat.length === 0) {
      return res.status(404).json({ success: false, message: 'Résultat non trouvé' });
    }

    const matchId = resultat[0].match_id;
    const etaitValide = resultat[0].validation_officielle;

    await pool.query('DELETE FROM resultats WHERE id = ?', [id]);
    await pool.query('UPDATE matchs SET statut = ? WHERE id = ?', ['programme', matchId]);

    // Si on supprime un résultat qui était validé, il faut recalculer le classement
    if (etaitValide) {
      const [match] = await pool.query('SELECT competition_id FROM matchs WHERE id = ?', [matchId]);
      if (match.length > 0) await syncClassementUtils.syncCompetition(match[0].competition_id);
    }

    res.json({ success: true, message: 'Résultat supprimé' });
  } catch (error) {
    console.error('Error deleting resultat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const getHistoriqueResultats = async (req, res) => {
  try {
    const { club_id, competition_id } = req.query;
    
    let query = `
      SELECT r.*, m.date_match, m.heure_match,
             cd.nom_club as club_domicile_nom, ce.nom_club as club_exterieur_nom,
             comp.nom_competition
      FROM resultats r
      JOIN matchs m ON r.match_id = m.id
      LEFT JOIN clubs cd ON m.club_domicile_id = cd.id
      LEFT JOIN clubs ce ON m.club_exterieur_id = ce.id
      LEFT JOIN competitions comp ON m.competition_id = comp.id
      WHERE r.validation_officielle = true
    `;
    const params = [];

    if (club_id) {
      query += ' AND (m.club_domicile_id = ? OR m.club_exterieur_id = ?)';
      params.push(club_id, club_id);
    }

    if (competition_id) {
      query += ' AND m.competition_id = ?';
      params.push(competition_id);
    }

    query += ' ORDER BY m.date_match DESC';

    const [result] = await pool.query(query, params);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting historique resultats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const setMatchButeurs = async (req, res) => {
  try {
    const { id } = req.params; // ID du résultat
    const { buteurs } = req.body; // Tableau de { joueur_id, nb_buts }

    // Récupérer le match_id associé au résultat
    const [resultat] = await pool.query('SELECT match_id FROM resultats WHERE id = ?', [id]);
    if (resultat.length === 0) {
      return res.status(404).json({ success: false, message: 'Résultat non trouvé' });
    }

    const matchId = resultat[0].match_id;

    // 1. Supprimer les anciens buteurs enregistrés pour ce match
    await pool.query('DELETE FROM match_buteurs WHERE match_id = ?', [matchId]);

    // 2. Insérer les nouveaux buteurs si le tableau n'est pas vide
    if (buteurs && buteurs.length > 0) {
      // Format attendu pour l'insertion multiple : [[val1, val2], [val1, val2]]
      const values = buteurs.map(b => [matchId, b.joueur_id, b.nb_buts]);
      
      await pool.query(
        'INSERT INTO match_buteurs (match_id, joueur_id, nb_buts) VALUES ?',
        [values]
      );
    }

    res.json({ success: true, message: 'Statistiques des buteurs mises à jour' });
  } catch (error) {
    console.error('Error setting match buteurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'enregistrement des buteurs' });
  }
};

module.exports = {
  getAllResultats,
  getResultatById,
  getResultatByMatch,
  createResultat,
  updateResultat,
  validateResultat,
  deleteResultat,
  getHistoriqueResultats,
  setMatchButeurs
};