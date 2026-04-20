-- Création de la table pour le suivi individuel des buteurs
CREATE TABLE IF NOT EXISTS match_buteurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    joueur_id INT NOT NULL,
    nb_buts INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matchs(id) ON DELETE CASCADE,
    FOREIGN KEY (joueur_id) REFERENCES joueurs(id) ON DELETE CASCADE,
    UNIQUE KEY (match_id, joueur_id)
);