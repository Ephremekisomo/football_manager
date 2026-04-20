-- Création de la table classements
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
);