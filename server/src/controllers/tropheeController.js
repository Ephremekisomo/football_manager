const pool = require('../config/database');

const tropheeController = {
  // GET /api/trophees - Liste tous les trophées avec filtres
  getAll: async (req, res) => {
    try {
      const { competition_id, type_trophee, limit = 50, page = 1 } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT t.*, 
               c.nom_competition as competition_nom,
               cg.nom_club as club_gagnant_nom,
               j.nom as joueur_nom
        FROM trophees t
        LEFT JOIN competitions c ON t.competition_id = c.id
        LEFT JOIN clubs cg ON t.club_gagnant_id = cg.id
        LEFT JOIN joueurs j ON t.joueur_gagnant_id = j.id
        WHERE 1=1
      `;
      const params = [];

      if (competition_id) {
        query += ' AND t.competition_id = ?';
        params.push(competition_id);
      }
      if (type_trophee) {
        query += ' AND t.type_trophee = ?';
        params.push(type_trophee);
      }

      query += ' ORDER BY t.date_remise DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [trophees] = await pool.query(query, params);

      // Compute safe auto-trophées (fallback si pas de data DB)
      const autoTrophees = [];
      
      // Champions auto: top classement si comp spécifiée
      if (competition_id) {
        try {
          let championQuery = `
            SELECT cl.equipe, cl.points, c.nom_competition, cl.club_id
            FROM classements cl
            JOIN competitions c ON cl.competition_id = c.id
            WHERE cl.competition_id = ?
            ORDER BY cl.points DESC, cl.diff_buts DESC LIMIT 1
          `;
          
          const [topClubs] = await pool.query(championQuery, [competition_id]);
          if (topClubs?.length > 0) {
            const topClub = topClubs[0];
            autoTrophees.push({
              nom_trophee: '🏆 Champion (Auto)',
              type_trophee: 'championnat',
              competition_id: competition_id,
              club_gagnant_id: topClub.club_id,
              competition_nom: topClub.nom_competition || 'Saison en cours',
              club_gagnant_nom: topClub.equipe,
              points: topClub.points,
              date_remise: new Date().toISOString().split('T')[0],
              is_auto: true
            });
          }
        } catch (e) {
          console.log('Auto-champion skip:', e.message);
        }
      }

      // Buteurs auto: fallback simple
      try {
        let buteursQuery = `
          SELECT j.nom, j.postnom, SUM(mb.nb_buts) as buts, c.nom_club
          FROM joueurs j 
          JOIN match_buteurs mb ON j.id = mb.joueur_id
          JOIN matchs m ON mb.match_id = m.id
          JOIN competitions comp ON m.competition_id = comp.id
          LEFT JOIN clubs c ON j.club_id = c.id
          WHERE 1=1
        `;
        const buteursParams = [];
        if (competition_id) { buteursQuery += ' AND m.competition_id = ?'; buteursParams.push(competition_id); }

        buteursQuery += ' GROUP BY j.id, j.nom, j.postnom, c.nom_club ORDER BY buts DESC LIMIT 5';
        const [topButeurs] = await pool.query(buteursQuery, buteursParams);
        
        topButeurs.forEach((buteur, idx) => {
          autoTrophees.push({
            nom_trophee: idx === 0 ? '🏆 Soulier d\'Or' : `🥅 Buteur #${idx+1}`,
            type_trophee: 'individuel',
            competition_id: competition_id,
            joueur_gagnant_id: buteur.id,
            joueur_nom: `${buteur.nom} ${buteur.postnom || ''}`,
            club_gagnant_nom: buteur.nom_club,
            buts: buteur.buts,
            date_remise: new Date().toISOString().split('T')[0],
            is_auto: true
          });
        });
      } catch (e) {
        console.log('Auto-buteurs skip:', e.message);
      }

      res.json({
        success: true,
        data: [...trophees, ...autoTrophees],
        pagination: { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          total: trophees.length + autoTrophees.length,
          auto_generated: autoTrophees.length > 0
        }
      });
    } catch (error) {
      console.error('Trophee getAll error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSaisonsUniques: async () => {
    try {
      const [saisons] = await pool.query('SELECT DISTINCT saison FROM competitions WHERE saison IS NOT NULL ORDER BY saison DESC');
      return saisons.length > 0 ? saisons.map(s => s.saison) : ['2026-2027', '2025-2026'];
    } catch {
      return ['2026-2027', '2025-2026'];
    }
  },

  // GET /api/trophees/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const [trophee] = await pool.query(`
        SELECT t.*, c.nom_competition as competition_nom, cg.nom_club as club_gagnant_nom
        FROM trophees t
        LEFT JOIN competitions c ON t.competition_id = c.id
        LEFT JOIN clubs cg ON t.club_gagnant_id = cg.id
        WHERE t.id = ?
      `, [id]);

      if (!trophee.length) {
        return res.status(404).json({ success: false, message: 'Trophée non trouvé' });
      }

      res.json({ success: true, data: trophee[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/trophees/champion/:competition_id - Attribuer trophée champion
  createChampionTrophee: async (req, res) => {
    try {
      const { competition_id } = req.params;

      // Vérifier comp existe et clôturée
      const [comp] = await pool.query('SELECT * FROM competitions WHERE id = ?', [competition_id]);
      if (!comp.length) return res.status(404).json({ success: false, message: 'Compétition non trouvée' });
      const statutNormalise = comp[0].statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (statutNormalise !== 'cloturee') return res.status(400).json({ success: false, message: 'La compétition doit être clôturée pour attribuer un trophée' });

      // Utiliser la table classements synchronisée pour trouver le champion
      const [topClub] = await pool.query(`
        SELECT club_id, equipe as nom_club, points, diff_buts
        FROM classements
        WHERE competition_id = ?
        ORDER BY points DESC, diff_buts DESC
        LIMIT 1
      `, [competition_id]);

      if (!topClub.length) return res.status(400).json({ success: false, message: 'Aucun classement disponible' });

      // Check if already attributed
      const [existing] = await pool.query("SELECT id FROM trophees WHERE competition_id = ? AND type_trophee = 'championnat'", [competition_id]);
      if (existing.length) return res.status(400).json({ success: false, message: 'Trophée champion déjà attribué' });

      // Insert trophée
      const [result] = await pool.query(`
        INSERT INTO trophees (nom_trophee, type_trophee, competition_id, club_gagnant_id, date_remise)
        VALUES (?, 'championnat', ?, ?, CURDATE())
      `, ['🏆 Champion ' + comp[0].saison, competition_id, topClub[0].club_id]);

      res.json({
        success: true,
        message: `Trophée champion attribué à ${topClub[0].nom_club}`,
        data: { trophee_id: result.insertId, club_gagnant: topClub[0] }
      });
    } catch (error) {
      console.error('createChampionTrophee error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = tropheeController;
