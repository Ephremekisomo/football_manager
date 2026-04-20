const pool = require('./database');
const syncClassementUtils = require('../controllers/syncClassements');

const createTables = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'visiteur',
        nom VARCHAR(100),
        prenom VARCHAR(100),
        telephone VARCHAR(20),
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        club_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS clubs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom_club VARCHAR(100) NOT NULL,
        sigle VARCHAR(10) NOT NULL,
        date_creation DATE,
        ville VARCHAR(100) NOT NULL,
        province VARCHAR(100),
        stade VARCHAR(100),
        couleurs VARCHAR(50),
        logo LONGTEXT,
        president VARCHAR(100),
        telephone VARCHAR(20),
        email VARCHAR(100),
        division INT DEFAULT 1,
        statut VARCHAR(20) DEFAULT 'actif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS joueurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        club_id INT,
        nom VARCHAR(100) NOT NULL,
        postnom VARCHAR(100),
        prenom VARCHAR(100),
        date_naissance DATE,
        nationalite VARCHAR(50) DEFAULT 'RDC',
        numero_maillot INT,
        poste VARCHAR(50),
        taille DECIMAL(5,2),
        poids DECIMAL(5,2),
        photo VARCHAR(255),
        date_signature DATE,
        fin_contrat DATE,
        statut VARCHAR(20) DEFAULT 'actif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS competitions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom_competition VARCHAR(100) NOT NULL,
        type_competition VARCHAR(50) NOT NULL,
        saison VARCHAR(10) NOT NULL,
        date_debut DATE,
        date_fin DATE,
        nombre_equipes INT,
        format_competition VARCHAR(50),
        statut VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS participations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        club_id INT,
        competition_id INT,
        date_inscription DATE DEFAULT (CURRENT_DATE),
        statut_validation VARCHAR(20) DEFAULT 'en_attente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_participation (club_id, competition_id),
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS arbitres (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        nom VARCHAR(100) NOT NULL,
        postnom VARCHAR(100),
        prenom VARCHAR(100),
        licence VARCHAR(20) UNIQUE,
        categorie VARCHAR(20),
        region VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS matchs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        competition_id INT,
        club_domicile_id INT,
        club_exterieur_id INT,
        journee INT,
        date_match DATE,
        heure_match TIME,
        stade VARCHAR(100),
        arbitre_id INT,
        statut VARCHAR(20) DEFAULT 'programme',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
        FOREIGN KEY (club_domicile_id) REFERENCES clubs(id) ON DELETE CASCADE,
        FOREIGN KEY (club_exterieur_id) REFERENCES clubs(id) ON DELETE CASCADE,
        FOREIGN KEY (arbitre_id) REFERENCES arbitres(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS resultats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        match_id INT,
        buts_domicile INT DEFAULT 0,
        buts_exterieur INT DEFAULT 0,
        observations TEXT,
        validation_officielle BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matchs(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS classements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        competition_id INT NOT NULL,
        club_id INT NOT NULL,
        equipe VARCHAR(255) NOT NULL,
        matchs_joues INT DEFAULT 0,
        victoires INT DEFAULT 0,
        nuls INT DEFAULT 0,
        defaites INT DEFAULT 0,
        buts_pour INT DEFAULT 0,
        buts_contre INT DEFAULT 0,
        diff_buts INT DEFAULT 0,
        points INT DEFAULT 0,
        forme VARCHAR(10) DEFAULT '',
        saison VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
        UNIQUE KEY (competition_id, equipe)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS trophees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom_trophee VARCHAR(100) NOT NULL,
        type_trophee VARCHAR(50) NOT NULL,
        description TEXT,
        competition_id INT,
        club_gagnant_id INT,
        joueur_gagnant_id INT,
        date_remise DATE,
        lieu_remise VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE SET NULL,
        FOREIGN KEY (club_gagnant_id) REFERENCES clubs(id) ON DELETE SET NULL,
        FOREIGN KEY (joueur_gagnant_id) REFERENCES joueurs(id) ON DELETE SET NULL
      )
    `);

    try { await connection.query(`CREATE INDEX idx_users_role ON users(role)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_users_club ON users(club_id)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_clubs_nom ON clubs(nom_club)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_clubs_statut ON clubs(statut)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_joueurs_club ON joueurs(club_id)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_joueurs_statut ON joueurs(statut)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_competitions_statut ON competitions(statut)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_participations_competition ON participations(competition_id)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_matchs_competition ON matchs(competition_id)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_classements_comp ON classements(competition_id)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_matchs_date ON matchs(date_match)`); } catch(e) {}
    try { await connection.query(`CREATE INDEX idx_resultats_match ON resultats(match_id)`); } catch(e) {}
    try { await connection.query(`ALTER TABLE classements ADD COLUMN club_id INT NOT NULL AFTER competition_id`); } catch(e) {}
    try { await connection.query(`ALTER TABLE classements ADD COLUMN forme VARCHAR(10) DEFAULT '' AFTER points`); } catch(e) {}

    console.log('All tables created successfully');

    // Synchronisation automatique des classements au démarrage du serveur
    try {
      console.log('Démarrage de la synchronisation automatique des classements...');
      await syncClassementUtils.syncAllClassements();
    } catch (syncError) {
      console.error('Erreur lors de la synchronisation automatique:', syncError.message);
    }

    try { await connection.query(`ALTER TABLE clubs MODIFY logo LONGTEXT`); } catch(e) {}
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = createTables;