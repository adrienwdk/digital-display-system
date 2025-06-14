const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Post = require('../models/Post');
const User = require('../models/User');
// Importer le service d'emails
const emailService = require('../services/emailService');

// Création des dossiers (code existant inchangé)
const uploadsDir = path.join(__dirname, '../uploads');
console.log("Chemin absolu du dossier uploads:", uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Dossier uploads créé");
}

// Créer les sous-dossiers pour les différents types de fichiers
const imageDir = path.join(uploadsDir, 'images');
console.log("Chemin absolu du dossier images:", imageDir);
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir);
  console.log("Dossier images créé");
}

const pdfsDir = path.join(uploadsDir, 'pdfs');
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir);
  console.log("Dossier pdfs créé");
}

const excelDir = path.join(uploadsDir, 'excel');
if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir);
  console.log("Dossier excel créé");
}

const otherDir = path.join(uploadsDir, 'other');
if (!fs.existsSync(otherDir)) {
  fs.mkdirSync(otherDir);
  console.log("Dossier other créé");
}

// Vérifier si les dossiers sont accessibles en écriture (code existant inchangé)
try {
  // Test d'écriture dans le dossier images
  const testFilePath = path.join(imageDir, 'test-write.txt');
  fs.writeFileSync(testFilePath, 'Test write access');
  console.log("Test d'écriture réussi dans:", testFilePath);
  // Supprimer le fichier de test
  fs.unlinkSync(testFilePath);
  console.log("Fichier de test supprimé");
} catch (err) {
  console.error("ERREUR: Impossible d'écrire dans le dossier images:", err.message);
}

// Configuration du stockage de fichiers avec multer (code existant inchangé)
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Déterminer le dossier de destination en fonction du type de fichier
    let uploadPath = uploadsDir;
    console.log("Traitement du fichier pour upload:", file.originalname, "mimetype:", file.mimetype);
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath = imageDir;
      console.log("Destination choisie: dossier images");
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = pdfsDir;
      console.log("Destination choisie: dossier pdfs");
    } else if (
      file.mimetype === 'application/vnd.ms-excel' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      uploadPath = excelDir;
      console.log("Destination choisie: dossier excel");
    } else {
      uploadPath = otherDir;
      console.log("Destination choisie: dossier other");
    }
    
    console.log("Chemin complet de destination:", uploadPath);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Créer un nom de fichier unique
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const newFilename = uniqueName + ext;
    console.log("Nouveau nom de fichier généré:", newFilename);
    cb(null, newFilename);
  }
});

// Filtre des fichiers autorisés (code existant inchangé)
const fileFilter = (req, file, cb) => {
  // Types MIME autorisés
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    // Documents PDF
    'application/pdf',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  console.log("Vérification du type de fichier:", file.mimetype);
  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log("Type de fichier autorisé");
    cb(null, true);
  } else {
    console.log("Type de fichier non autorisé");
    cb(new Error(`Type de fichier non autorisé. Types autorisés: images, PDF, Excel`), false);
  }
};

// Configuration de multer (code existant inchangé)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite à 10MB
    files: 10 // Max 10 fichiers par post
  }
});

// Fonction pour déterminer le type de fichier (code existant inchangé)
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return 'image';
  } else if (mimetype === 'application/pdf') {
    return 'pdf';
  } else if (
    mimetype === 'application/vnd.ms-excel' || 
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'excel';
  } else {
    return 'other';
  }
};

// ROUTE MODIFIÉE: Création d'un post avec le département de l'utilisateur
router.post('/', auth, upload.array('files', 10), async (req, res) => {
  try {
    console.log("========== DÉBUT DEBUG UPLOAD ==========");
    console.log("Requête POST reçue pour créer un post");
    console.log("Corps de la requête:", req.body);
    console.log("Fichiers reçus:", req.files?.length || 0, "fichiers");
    
    // Vérification détaillée des fichiers uploadés
    if (req.files && req.files.length > 0) {
      console.log(`Nombre de fichiers reçus: ${req.files.length}`);
      req.files.forEach((file, idx) => {
        console.log(`Fichier ${idx}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          destination: file.destination,
          filename: file.filename,
          path: file.path,
          size: file.size
        });

        // Vérifier si le fichier existe réellement sur le disque
        const fileExists = fs.existsSync(file.path);
        console.log(`Le fichier ${idx} existe sur disque: ${fileExists}`);
        
        // Si c'est une image, vérifier le chemin relatif qui sera stocké
        if (file.mimetype.startsWith('image/')) {
          const relativePath = '/' + file.path.split(path.sep).slice(-3).join('/');
          console.log(`Chemin relatif de l'image ${idx}: ${relativePath}`);
        }
      });
    } else {
      console.log("Aucun fichier reçu");
    }
    
    const { content, title, tags } = req.body;
    
    // Récupérer les informations de l'utilisateur depuis la base de données
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Créer un nouveau post
    const newPost = new Post({
      content,
      title: title || '',
      author: `${user.firstName} ${user.lastName}`,
      role: user.role,
      userId: req.user.id,
      likes: 0,
      comments: 0,
      status: user.isAdmin ? 'approved' : 'pending', // Les posts des admins sont auto-approuvés
      service: user.service, // Utiliser le service de l'utilisateur
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    
    // Traiter les fichiers téléchargés
    if (req.files && req.files.length > 0) {
      console.log("Traitement des fichiers pour le post...");
      
      // Pour la rétrocompatibilité - uniquement pour les images
      newPost.images = req.files
        .filter(file => file.mimetype.startsWith('image/'))
        .map(file => {
          // Format du chemin de fichier relatif, par exemple: /uploads/images/123456.jpg
          // Utiliser la méthode adaptée selon l'OS pour construire le chemin
          const pathParts = file.path.split(path.sep);
          const relativePath = '/' + pathParts.slice(-3).join('/');
          console.log("Chemin d'image relatif généré:", relativePath);
          
          // Vérifier si le fichier existe réellement
          if (fs.existsSync(file.path)) {
            console.log("Le fichier existe bien à:", file.path);
          } else {
            console.error("ALERTE: Le fichier n'existe pas à:", file.path);
          }
          
          return relativePath;
        });
      
      console.log("Images ajoutées au post:", newPost.images);
      
      // Utiliser directement le chemin du fichier pour vérifier le problème
      if (newPost.images.length > 0) {
        const firstImage = newPost.images[0];
        const absolutePath = path.join(__dirname, '..', firstImage.substring(1));
        console.log("Chemin absolu de la première image:", absolutePath);
        console.log("Ce fichier existe-t-il?", fs.existsSync(absolutePath));
      }
      
      // Nouveau format structuré pour tous les fichiers
      newPost.files = req.files.map(file => {
        // Format du chemin de fichier relatif
        const pathParts = file.path.split(path.sep);
        const relativePath = '/' + pathParts.slice(-3).join('/');
        console.log("Chemin de fichier relatif généré:", relativePath);
        return {
          path: relativePath,
          originalName: file.originalname,
          fileType: getFileType(file.mimetype),
          size: file.size
        };
      });
      
      console.log("Tous les fichiers ajoutés au post:", newPost.files);
    } else {
      console.log("Aucun fichier reçu avec cette requête");
    }
    
    // Sauvegarder le post
    await newPost.save();
    console.log("Post créé avec succès:", {
      id: newPost._id,
      content: newPost.content,
      department: newPost.department,
      imagesCount: newPost.images?.length || 0,
      filesCount: newPost.files?.length || 0
    });
    
    console.log("Images du post créé:", newPost.images);
    console.log("Fichiers du post créé:", newPost.files);
    console.log("========== FIN DEBUG UPLOAD ==========");
    
    // Créer manuellement une copie du post pour la réponse
    // Cela permet de s'assurer que les tableaux images et files sont bien inclus
    const responsePost = {
      ...newPost.toObject(),
      images: newPost.images || [],
      files: newPost.files || []
    };
    
    res.status(201).json(responsePost);
  } catch (err) {
    console.error("Erreur lors de la création du post:", err);
    res.status(500).json({ 
      message: "Erreur lors de la création du post", 
      error: err.message,
      stack: err.stack 
    });
  }
});

// Route pour récupérer tous les posts (public - retourne seulement les posts approuvés)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Erreur lors de la récupération des posts:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des posts" });
  }
});

// NOUVELLE ROUTE: Récupérer les posts par service
// NOUVELLE ROUTE: Récupérer les posts par service avec débogage amélioré
router.get('/service/:service', async (req, res) => {
  try {
    // Logs de débogage détaillés
    console.log(`===== DÉBUT DÉBOGAGE ROUTE SERVICE =====`);
    console.log(`Service demandé: "${req.params.service}"`);
    
    // Vérifier d'abord tous les posts pour voir leurs services
    const allPosts = await Post.find({ status: 'approved' });
    console.log(`Nombre total de posts approuvés: ${allPosts.length}`);
    console.log(`Services disponibles dans les posts: ${[...new Set(allPosts.map(p => p.service))].join(', ')}`);
    
    // Requête pour le service spécifique
    const posts = await Post.find({ 
      service: req.params.service,
      status: 'approved'
    }).sort({ createdAt: -1 });
    
    console.log(`Nombre de posts trouvés pour le service "${req.params.service}": ${posts.length}`);
    
    // Si aucun post trouvé, montrer quelques exemples de posts pour le débogage
    if (posts.length === 0 && allPosts.length > 0) {
      console.log('Exemples de posts disponibles:');
      allPosts.slice(0, 3).forEach((post, i) => {
        console.log(`Post ${i+1}: ID=${post._id}, Service=${post.service}, Status=${post.status}`);
      });
    }
    
    console.log(`===== FIN DÉBOGAGE ROUTE SERVICE =====`);
    res.json(posts);
  } catch (err) {
    console.error("Erreur lors de la récupération des posts par service:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des posts" });
  }
});

// Route pour récupérer les posts en attente (admin seulement)
router.get('/pending', auth, admin, async (req, res) => {
  try {
    const pendingPosts = await Post.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(pendingPosts);
  } catch (err) {
    console.error("Erreur lors de la récupération des posts en attente:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des posts" });
  }
});

// ROUTE MODIFIÉE: Approbation de post avec notification
router.put('/:id/approve', auth, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }
    
    // Mettre à jour le statut
    post.status = 'approved';
    post.approvedBy = req.user.id;
    post.approvedAt = Date.now();
    
    // Sauvegarder le post
    await post.save();
    
    // Envoyer des notifications par email si elles n'ont pas déjà été envoyées
    if (!post.notificationSent) {
      try {
        // Récupérer tous les utilisateurs actifs avec notifications activées
        const users = await User.find({ 
          isActive: true,
          notificationsEnabled: true
        });
        
        if (users.length > 0) {
          console.log(`Envoi de notifications à ${users.length} utilisateurs pour le post ${post._id}`);
          await emailService.sendNewPostNotifications(post, users);
          
          // Marquer les notifications comme envoyées
          post.notificationSent = true;
          await post.save();
        } else {
          console.log(`Aucun utilisateur avec notifications activées trouvé`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi des notifications:', error);
        // Continuer l'exécution même en cas d'erreur d'envoi des emails
      }
    }
    
    res.json(post);
  } catch (err) {
    console.error("Erreur lors de l'approbation du post:", err);
    res.status(500).json({ message: "Erreur lors de l'approbation du post" });
  }
});

// ROUTE MODIFIÉE: Rejet d'un post avec raison
router.put('/:id/reject', auth, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }
    
    // Récupérer la raison du rejet si fournie
    const { rejectionReason } = req.body;
    
    post.status = 'rejected';
    post.rejectionReason = rejectionReason || 'Aucune raison spécifiée';
    await post.save();
    
    res.json(post);
  } catch (err) {
    console.error("Erreur lors du rejet du post:", err);
    res.status(500).json({ message: "Erreur lors du rejet du post" });
  }
});

// Route pour télécharger un fichier spécifique (inchangée)
router.get('/download/:id/:fileIndex', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }
    
    const fileIndex = parseInt(req.params.fileIndex);
    
    if (!post.files || !post.files[fileIndex]) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }
    
    const file = post.files[fileIndex];
    const filePath = path.join(__dirname, '..', file.path.substring(1)); // Enlever le '/' initial
    
    res.download(filePath, file.originalName);
  } catch (err) {
    console.error("Erreur lors du téléchargement du fichier:", err);
    res.status(500).json({ message: "Erreur lors du téléchargement du fichier" });
  }
});

// Route pour supprimer un post (admin seulement ou propriétaire du post) (inchangée)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }
    
    // Vérifier si l'utilisateur est admin ou propriétaire du post
    const user = await User.findById(req.user.id);
    if (!user.isAdmin && post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à supprimer ce post" });
    }
    
    // Supprimer les fichiers associés au post
    if (post.files && post.files.length > 0) {
      post.files.forEach(file => {
        const filePath = path.join(__dirname, '..', file.path.substring(1));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    await post.deleteOne();
    
    res.json({ message: "Post supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression du post:", err);
    res.status(500).json({ message: "Erreur lors de la suppression du post" });
  }
});

// Route de test pour l'upload de fichiers (inchangée)
router.post('/test-upload', upload.array('files', 10), (req, res) => {
  console.log("TEST UPLOAD - Requête reçue");
  console.log("TEST UPLOAD - Fichiers:", req.files);
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("Aucun fichier reçu");
  }
  
  // Vérifier si les fichiers ont été correctement sauvegardés
  const fileResults = req.files.map(file => {
    const exists = fs.existsSync(file.path);
    return {
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      exists: exists,
      size: exists ? fs.statSync(file.path).size : 0
    };
  });
  
  res.send({
    message: "Fichiers reçus",
    filesCount: req.files.length,
    files: fileResults
  });
});

// Vérifier les permissions des dossiers (inchangée)
['uploads', 'uploads/images', 'uploads/pdfs', 'uploads/excel', 'uploads/other'].forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    try {
      const testFile = path.join(fullPath, '.permission-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`✅ Permissions d'écriture OK pour ${dir}`);
    } catch (e) {
      console.error(`❌ ERREUR: Impossible d'écrire dans ${dir}:`, e.message);
    }
  } else {
    console.error(`❌ ERREUR: Le dossier ${dir} n'existe pas`);
  }
});

module.exports = router;