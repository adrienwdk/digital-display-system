// server/server.js (ajout des routes OAuth)
require('dotenv').config();

const express = require('express');
const connectDB = require('./db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Connexion à la base de données
connectDB();

// Configuration CORS améliorée pour OAuth
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour parser les formulaires
app.use(express.urlencoded({ extended: true }));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes existantes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));

// NOUVELLE ROUTE: OAuth
app.use('/api/oauth', require('./routes/oauth'));

// Vérification des dossiers d'upload (code existant...)
console.log("Vérification des dossiers d'upload...");
console.log(`Dossier uploads: ${fs.existsSync(uploadsDir) ? 'Existe' : 'N\'existe pas'}`);

const imageDir = path.join(uploadsDir, 'images');
if (!fs.existsSync(imageDir)) {
  console.log("Création du dossier images...");
  fs.mkdirSync(imageDir);
} else {
  console.log("Dossier images existe déjà");
}

const pdfsDir = path.join(uploadsDir, 'pdfs');
if (!fs.existsSync(pdfsDir)) {
  console.log("Création du dossier pdfs...");
  fs.mkdirSync(pdfsDir);
} else {
  console.log("Dossier pdfs existe déjà");
}

const excelDir = path.join(uploadsDir, 'excel');
if (!fs.existsSync(excelDir)) {
  console.log("Création du dossier excel...");
  fs.mkdirSync(excelDir);
} else {
  console.log("Dossier excel existe déjà");
}

const otherDir = path.join(uploadsDir, 'other');
if (!fs.existsSync(otherDir)) {
  console.log("Création du dossier other...");
  fs.mkdirSync(otherDir);
} else {
  console.log("Dossier other existe déjà");
}

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Erreur serveur', error: err.message });
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Les fichiers statiques sont servis depuis: ${path.join(__dirname, 'uploads')}`);
  console.log(`OAuth configuré avec Azure AD`);
});

// Route de test pour vérifier l'accès aux fichiers statiques
app.get('/test-static', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const imageDir = path.join(uploadsDir, 'images');
  
  // Lister les fichiers dans le dossier d'images
  fs.readdir(imageDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Construire les URLs pour chaque fichier
    const fileUrls = files.map(file => ({
      filename: file,
      url: `http://localhost:5000/uploads/images/${file}`
    }));
    
    res.json({
      message: 'Liste des fichiers disponibles',
      files: fileUrls,
      imageDir: imageDir
    });
  });
});