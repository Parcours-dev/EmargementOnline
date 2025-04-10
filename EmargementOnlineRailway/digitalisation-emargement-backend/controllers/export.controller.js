const db = require("../config/db");         // Connexion à la base de données
const ExcelJS = require("exceljs");         // Librairie pour générer des fichiers Excel ou CSV

// 🧠 Fonction utilitaire pour construire dynamiquement la requête SQL selon les filtres reçus en query
function buildQuery(queryParams) {
    const {
        date,                // Ex: "2025-04-12"
        from, to,            // Plage de dates
        promo,               // Nom de la promotion
        id_groupe_TD,
        id_groupe_Anglais,
        email,               // Email d’un étudiant
        type                 // "presents" | "absents"
    } = queryParams;

    const conditions = [];   // Conditions WHERE
    const params = [];       // Paramètres SQL à injecter

    // 🕐 Plage de dates à filtrer
    let dateDebut, dateFin;
    if (date) {
        dateDebut = `${date} 00:00:00`;
        dateFin = `${date} 23:59:59`;
    } else if (from && to) {
        dateDebut = `${from} 00:00:00`;
        dateFin = `${to} 23:59:59`;
    }

    // 🔧 Base de la requête SQL avec toutes les jointures nécessaires
    let sql = `
        SELECT
            e.NEtudiant,
            e.nom,
            e.prenom,
            e.email,
            p.nom AS promotion,
            gTD.nom AS groupe_TD,
            gA.nom AS groupe_Anglais,
            cr.date_heure_debut,
            cr.date_heure_fin,
            c.nom AS nom_cours,
            em.date_heure_signature,
            em.ajout_manuel,
            em.valide_par,
            em.ip_adresse,
            em.user_agent
        FROM etudiant e
        JOIN groupe gTD ON gTD.id_groupe = e.id_groupe_TD
        JOIN promotion p ON p.id_promotion = gTD.id_promotion
        JOIN groupe gA ON gA.id_groupe = e.id_groupe_Anglais
        JOIN creneau cr ON cr.id_groupe IN (e.id_groupe_TD, e.id_groupe_Anglais)
        JOIN cours c ON c.id_cours = cr.id_cours
        LEFT JOIN emargement em ON
            em.NEtudiant = e.NEtudiant AND
            em.id_cours = cr.id_cours AND
            em.date_heure_debut = cr.date_heure_debut
    `;

    // 🔍 Ajout dynamique des filtres
    if (dateDebut && dateFin) {
        conditions.push("cr.date_heure_debut BETWEEN ? AND ?");
        params.push(dateDebut, dateFin);
    }

    if (promo) {
        conditions.push("p.nom = ?");
        params.push(promo);
    }

    if (id_groupe_TD) {
        conditions.push("e.id_groupe_TD = ?");
        params.push(id_groupe_TD);
    }

    if (id_groupe_Anglais) {
        conditions.push("e.id_groupe_Anglais = ?");
        params.push(id_groupe_Anglais);
    }

    if (email) {
        conditions.push("e.email = ?");
        params.push(email);
    }

    // 🎯 Filtre présence ou absence
    if (type === "presents") {
        conditions.push("em.NEtudiant IS NOT NULL");
    } else if (type === "absents") {
        conditions.push("em.NEtudiant IS NULL");
    }

    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY cr.date_heure_debut DESC";

    return { sql, params };
}

// 📦 Renvoie les présences au format JSON
const getPresencesJson = async (req, res) => {
    try {
        const { sql, params } = buildQuery(req.query); // Génère la requête selon les filtres
        const [rows] = await db.query(sql, params);

        // ➕ On ajoute un champ "present" booléen basé sur date_heure_signature
        const json = rows.map(row => ({
            ...row,
            present: !!row.date_heure_signature
        }));

        res.json(json);
    } catch (err) {
        console.error("Erreur JSON export :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 📥 Génère et envoie un fichier Excel ou CSV selon les données filtrées
const exportPresencesFile = async (req, res) => {
    try {
        const { sql, params } = buildQuery(req.query);
        const [rows] = await db.query(sql, params);

        const format = req.query.format === "csv" ? "csv" : "xlsx";           // Format final
        const includeDetails = req.query.withInfos === "true";                // Détails IP/User-Agent ?

        // 🔤 Construction du nom de fichier dynamique
        const { promo, date, from, to, type } = req.query;
        let fileName = "export_presences";
        if (promo) fileName += `_${promo.replace(/\s/g, "")}`;
        if (date) fileName += `_${date}`;
        else if (from && to) fileName += `_${from}_to_${to}`;
        if (type) fileName += `_${type}`;
        fileName += `.${format}`;

        // 📄 Création du fichier via ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Présences");

        // En-têtes du tableau
        const baseHeaders = [
            "Numéro Étudiant", "Nom", "Prénom", "Email", "Promotion",
            "Groupe TD", "Groupe Anglais", "Cours",
            "Début cours", "Fin cours", "Présent ?", "Ajout manuel", "Validé par"
        ];
        const extraHeaders = ["Adresse IP", "User Agent"];
        const headers = includeDetails ? baseHeaders.concat(extraHeaders) : baseHeaders;

        worksheet.addRow(headers);

        // 🧾 Remplissage des lignes de données
        rows.forEach(row => {
            const present = row.date_heure_signature ? "Oui" : "Non";
            const values = [
                row.NEtudiant,
                row.nom,
                row.prenom,
                row.email,
                row.promotion,
                row.groupe_TD,
                row.groupe_Anglais,
                row.nom_cours,
                row.date_heure_debut,
                row.date_heure_fin,
                present,
                row.ajout_manuel ? "Oui" : "Non",
                row.valide_par || ""
            ];

            if (includeDetails) {
                values.push(row.ip_adresse || "", row.user_agent || "");
            }

            worksheet.addRow(values);
        });

        // 📤 Préparation des headers HTTP pour le téléchargement
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

        if (format === "csv") {
            res.setHeader("Content-Type", "text/csv");
            await workbook.csv.write(res); // Envoi CSV
        } else {
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            await workbook.xlsx.write(res); // Envoi Excel
        }
    } catch (err) {
        console.error("Erreur fichier export :", err);
        res.status(500).json({ message: "Erreur serveur lors de l’export." });
    }
};

module.exports = {
    getPresencesJson,
    exportPresencesFile
};
