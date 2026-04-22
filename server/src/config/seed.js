const pool = require('./database');
const bcrypt = require('bcryptjs');

 const seedDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [adminCheck] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@football.com']);
    if (adminCheck.length > 0) {
      console.log('Database already seeded');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin123*', 10);

    await connection.query(
      'INSERT INTO users (username, email, password_hash, role, nom, prenom, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['superadmin', 'admin@football.com', hashedPassword, 'super_admin', 'Administrateur', 'Principal', true]
    );

    const users = [
      { username: 'admin_sportif', email: 'admin@sport.com', role: 'admin_sportif', password: 'Admin123*', nom: 'Admin', prenom: 'Sportif' },
      { username: 'resp_ocjs', email: 'ocjs@club.com', role: 'responsable_club', password: 'Admin123*', nom: 'Responsable', prenom: 'Club' },
      { username: 'arbitre1', email: 'arbitre@test.com', role: 'arbitre', password: 'Admin123*', nom: 'Arbitre', prenom: 'Jean' },
      { username: 'visiteur1', email: 'visiteur@test.com', role: 'visiteur', password: 'Admin123*', nom: 'Visiteur', prenom: 'Test' }
    ];

    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      await connection.query(
        'INSERT INTO users (username, email, password_hash, role, nom, prenom, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.username, user.email, hash, user.role, user.nom, user.prenom, true]
      );
    }

    const clubs = [
     
      { nom: 'AS Vita Club', sigle: 'ASVC', ville: 'Kinshasa', province: 'Kinshasa', stade: 'Stade des Martyrs', couleurs: 'Jaune et Noir', president: 'Pierre Okud', telephone: '+243812345679', email: 'asvita@asvc.cd' },
      { nom: 'TP Mazembe', sigle: 'TPM', ville: 'Lubumbashi', province: 'Haut-Lu kata', stade: 'Stade Kamalondo', couleurs: 'Noir et Blanc', president: 'Mohamed Bah', telephone: '+243812345680', email: 'tpmazembe@tpm.cd' }
    ];

    for (const club of clubs) {
      await connection.query(
        'INSERT INTO clubs (nom_club, sigle, ville, province, stade, couleurs, president, telephone, email, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [club.nom, club.sigle, club.ville, club.province, club.stade, club.couleurs, club.president, club.telephone, club.email, 'actif']
      );
    }

    const joueurs = [
      { club_id: 1, nom: 'Mwanza', postnom: 'Kabongo', prenom: 'Christian', date_naissance: '1995-03-15', nationalite: 'RDC', numero_maillot: 10, poste: 'Avant-centre' },
      { club_id: 1, nom: 'Kasongo', postnom: 'Mwamba', prenom: 'Paul', date_naissance: '1998-07-22', nationalite: 'RDC', numero_maillot: 8, poste: 'Milieu' },
      { club_id: 1, nom: 'Mudek', postnom: 'Kakesa', prenom: 'Dieudonné', date_naissance: '1992-11-10', nationalite: 'RDC', numero_maillot: 1, poste: 'Gardien' },
      { club_id: 2, nom: 'Lutumba', postnom: 'Mpe', prenom: 'Meschack', date_naissance: '1996-05-18', nationalite: 'RDC', numero_maillot: 10, poste: 'Avant-centre' },
      { club_id: 2, nom: 'Nkulu', postnom: 'Mbuyi', prenom: 'Alex', date_naissance: '1997-09-25', nationalite: 'RDC', numero_maillot: 5, poste: 'Défenseur' },
      { club_id: 3, nom: 'Bayo', postnom: 'Sylla', prenom: 'Moses', date_naissance: '1994-12-03', nationalite: 'RDC', numero_maillot: 10, poste: 'Attaquant' },
      { club_id: 3, nom: 'Mwanga', postnom: 'Buluma', prenom: 'Trinity', date_naissance: '1999-01-15', nationalite: 'RDC', numero_maillot: 7, poste: 'Milieu' },
      { club_id: 3, nom: 'Kakudji', postnom: 'Ngoy', prenom: 'Prince', date_naissance: '1993-06-28', nationalite: 'RDC', numero_maillot: 1, poste: 'Gardien' }
    ];

    for (const joueur of joueurs) {
      await connection.query(
        'INSERT INTO joueurs (club_id, nom, postnom, prenom, date_naissance, nationalite, numero_maillot, poste, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [joueur.club_id, joueur.nom, joueur.postnom, joueur.prenom, joueur.date_naissance, joueur.nationalite, joueur.numero_maillot, joueur.poste, 'actif']
      );
    }

    await connection.query(
      'INSERT INTO competitions (nom_competition, type_competition, saison, date_debut, date_fin, nombre_equipes, format_competition, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['Ligue 1', 'championnat', '2024-2025', '2024-09-15', '2025-05-30', 16, 'poule_unique', 'active']
    );

    await connection.query(
      'INSERT INTO competitions (nom_competition, type_competition, saison, date_debut, date_fin, nombre_equipes, format_competition, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['Coupe du Congo', 'coupe', '2024-2025', '2024-11-01', '2025-02-28', 32, 'elimination_directe', 'active']
    );

    await connection.query('INSERT INTO participations (club_id, competition_id, statut_validation) VALUES (?, ?, ?)', [1, 1, 'valide']);
    await connection.query('INSERT INTO participations (club_id, competition_id, statut_validation) VALUES (?, ?, ?)', [2, 1, 'valide']);
    await connection.query('INSERT INTO participations (club_id, competition_id, statut_validation) VALUES (?, ?, ?)', [3, 1, 'valide']);

    await connection.query(
      'INSERT INTO arbitres (nom, postnom, prenom, licence, categorie, region) VALUES (?, ?, ?, ?, ?, ?)',
      ['Mbuyi', 'Kabongo', 'Jean', 'ARB001', 'National', 'Kinshasa']
    );

    await connection.query("UPDATE users SET club_id = 2 WHERE username = 'resp_ocjs'");
    await connection.query("UPDATE users SET club_id = 1 WHERE username = 'admin_sportif'");

    await connection.query(
      'INSERT INTO matchs (competition_id, club_domicile_id, club_exterieur_id, journee, date_match, heure_match, arbitre_id, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 2, 1, '2024-09-22', '15:00:00', 1, 'termine']
    );

    await connection.query(
      'INSERT INTO matchs (competition_id, club_domicile_id, club_exterieur_id, journee, date_match, heure_match, arbitre_id, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 3, 1, 1, '2024-09-22', '18:00:00', 1, 'termine']
    );

    await connection.query(
      'INSERT INTO matchs (competition_id, club_domicile_id, club_exterieur_id, journee, date_match, heure_match, arbitre_id, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 2, 3, 2, '2024-09-29', '15:00:00', 1, 'programme']
    );

    await connection.query(
      'INSERT INTO resultats (match_id, buts_domicile, buts_exterieur, validation_officielle) VALUES (?, ?, ?, ?)',
      [1, 2, 1, true]
    );

    await connection.query(
      'INSERT INTO resultats (match_id, buts_domicile, buts_exterieur, validation_officielle) VALUES (?, ?, ?, ?)',
      [2, 1, 1, true]
    );

    await connection.query(
      'INSERT INTO trophees (nom_trophee, type_trophee, competition_id, club_gagnant_id, date_remise, lieu_remise) VALUES (?, ?, ?, ?, ?, ?)',
      ['Champion', 'championnat', 1, 1, '2023-06-15', 'Kinshasa']
    );

    await connection.query(
      'INSERT INTO trophees (nom_trophee, type_trophee, competition_id, club_gagnant_id, date_remise, lieu_remise) VALUES (?, ?, ?, ?, ?, ?)',
      ['Meilleur Joueur', 'individuel', 1, 4, '2023-06-15', 'Kinshasa']
    );

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}; 

module.exports = seedDatabase;