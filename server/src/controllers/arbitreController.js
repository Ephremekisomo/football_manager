const pool = require('../config/database');

const getAllArbitres = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', categorie = '', region = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM arbitres WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (LOWER(nom) LIKE ? OR LOWER(postnom) LIKE ? OR LOWER(prenom) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    if (categorie) {
      query += ' AND categorie = ?';
      params.push(categorie);
    }

    if (region) {
      query += ' AND LOWER(region) LIKE ?';
      params.push(`%${region.toLowerCase()}%`);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = parseInt(countResult.total);

    query += ' ORDER BY nom ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [result] = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        arbitres: result,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting arbitres:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const getArbitreById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('SELECT * FROM arbitres WHERE id = ?', [id]);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Arbitre non trouvé' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error getting arbitre:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const createArbitre = async (req, res) => {
  try {
    const { user_id, nom, postnom, prenom, licence, categorie, region } = req.body;

    if (!nom) {
      return res.status(400).json({ success: false, message: 'Nom requis' });
    }

    await pool.query(
      'INSERT INTO arbitres (user_id, nom, postnom, prenom, licence, categorie, region) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, nom, postnom, prenom, licence, categorie, region]
    );

    const [newArbitre] = await pool.query('SELECT * FROM arbitres WHERE nom = ?', [nom]);

    res.status(201).json({ success: true, data: newArbitre[0] });
  } catch (error) {
    console.error('Error creating arbitre:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const updateArbitre = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, nom, postnom, prenom, licence, categorie, region } = req.body;

    const [existingArbitre] = await pool.query('SELECT * FROM arbitres WHERE id = ?', [id]);
    if (existingArbitre.length === 0) {
      return res.status(404).json({ success: false, message: 'Arbitre non trouvé' });
    }

    let updateFields = [];
    let updateValues = [];

    if (user_id !== undefined) { updateFields.push('user_id = ?'); updateValues.push(user_id); }
    if (nom) { updateFields.push('nom = ?'); updateValues.push(nom); }
    if (postnom) { updateFields.push('postnom = ?'); updateValues.push(postnom); }
    if (prenom) { updateFields.push('prenom = ?'); updateValues.push(prenom); }
    if (licence) { updateFields.push('licence = ?'); updateValues.push(licence); }
    if (categorie) { updateFields.push('categorie = ?'); updateValues.push(categorie); }
    if (region) { updateFields.push('region = ?'); updateValues.push(region); }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
    }

    updateValues.push(id);
    await pool.query(`UPDATE arbitres SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [result] = await pool.query('SELECT * FROM arbitres WHERE id = ?', [id]);

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating arbitre:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

const deleteArbitre = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingArbitre] = await pool.query('SELECT id FROM arbitres WHERE id = ?', [id]);
    if (existingArbitre.length === 0) {
      return res.status(404).json({ success: false, message: 'Arbitre non trouvé' });
    }

    await pool.query('DELETE FROM arbitres WHERE id = ?', [id]);

    res.json({ success: true, message: 'Arbitre supprimé' });
  } catch (error) {
    console.error('Error deleting arbitre:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getAllArbitres,
  getArbitreById,
  createArbitre,
  updateArbitre,
  deleteArbitre
};