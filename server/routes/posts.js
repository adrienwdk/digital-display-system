// server/routes/posts.js - Version corrigée pour le filtrage par service
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Post = require('../models/Post');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Configuration multer existante (inchangée)
const uploadsDir = path.join(__dirname, '../uploads');
console.log("Chemin absolu du dossier uploads:", uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Dossier uploads créé");
}

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

// Configuration multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = uploadsDir;
    console.log("Traitement du fichier pour upload:", file.originalname, "mimetype:", file.mimetype);
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath = imageDir;
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = pdfsDir;
    } else if (
      file.mimetype === 'application/vnd.ms-excel' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      uploadPath = excelDir;
    } else {
      uploadPath = otherDir;
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const newFilename = uniqueName + ext;
    cb(null, newFilename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Types autorisés: images, PDF, Excel`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10
  }
});

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

// ==================== ROUTES POUR LES RÉACTIONS ====================

// Route pour ajouter/modifier une réaction à un post
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { reactionType } = req.body;
    const postId = req.params.id;
    
    const validReactions = ['like', 'love', 'bravo', 'interesting', 'welcome'];
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({ message: 'Type de réaction invalide' });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const userName = `${user.firstName} ${user.lastName}`;
    
    post.addReaction(req.user.id, userName, reactionType);
    await post.save();
    
    res.json({
      message: 'Réaction ajoutée avec succès',
      reactions: post.getFormattedReactions(),
      userReaction: reactionType
    });
    
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la réaction:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour retirer une réaction d'un post
router.delete('/:id/react', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }
    
    const userReactionType = post.getUserReaction(req.user.id);
    
    if (userReactionType) {
      post.removeReaction(req.user.id, userReactionType);
      await post.save();
    }
    
    res.json({
      message: 'Réaction retirée avec succès',
      reactions: post.getFormattedReactions(),
      userReaction: null
    });
    
  } catch (err) {
    console.error('Erreur lors de la suppression de la réaction:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour obtenir les réactions d'un post
router.get('/:id/reactions', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }
    
    res.json({
      reactions: post.getFormattedReactions(),
      totalReactions: post.getTotalReactions()
    });
    
  } catch (err) {
    console.error('Erreur lors de la récupération des réactions:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour obtenir la réaction d'un utilisateur spécifique sur un post
router.get('/:id/user-reaction', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }
    
    const userReaction = post.getUserReaction(req.user.id);
    
    res.json({
      userReaction: userReaction,
      reactions: post.getFormattedReactions()
    });
    
  } catch (err) {
    console.error('Erreur lors de la récupération de la réaction utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ==================== ROUTES POUR LES POSTS ====================

// Route pour créer un post - LOGIQUE CORRIGÉE
router.post('/', auth, upload.array('files', 10), async (req, res) => {
  try {
    console.log("========== DÉBUT CRÉATION POST ==========");
    console.log("Corps de la requête:", req.body);
    console.log("Fichiers reçus:", req.files?.length || 0, "fichiers");
    
    const { content, title, tags, service } = req.body;
    
    // CORRECTION: Validation du service
    const validServices = ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité', 'general'];
    
    // Récupérer les informations de l'utilisateur
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // CORRECTION: Déterminer le service du post
    let postService = service || 'general';
    
    // Si le service choisi est 'general' mais que l'utilisateur a un service spécifique
    if (postService === 'general' && user.service && user.service !== 'general') {
      postService = user.service;
      console.log(`Service 'general' choisi mais utilisateur du service '${user.service}', utilisation du service utilisateur`);
    }
    
    // Validation du service
    if (!validServices.includes(postService)) {
      console.error(`Service invalide: ${postService}`);
      return res.status(400).json({ 
        message: 'Service invalide', 
        validServices: validServices,
        receivedService: postService
      });
    }
    
    console.log(`Création du post avec le service: ${postService}`);
    
    // Créer un nouveau post
    const newPost = new Post({
      content,
      title: title || '',
      author: `${user.firstName} ${user.lastName}`,
      role: user.role,
      userId: req.user.id,
      status: user.isAdmin ? 'approved' : 'pending',
      service: postService, // CORRECTION: Utiliser le service validé
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      reactions: {
        like: { count: 0, users: [] },
        love: { count: 0, users: [] },
        bravo: { count: 0, users: [] },
        interesting: { count: 0, users: [] },
        welcome: { count: 0, users: [] }
      },
      likes: 0
    });
    
    // Traitement des fichiers (code existant inchangé)
    if (req.files && req.files.length > 0) {
      console.log("Traitement des fichiers pour le post...");
      
      newPost.images = req.files
        .filter(file => file.mimetype.startsWith('image/'))
        .map(file => {
          const pathParts = file.path.split(path.sep);
          const relativePath = '/' + pathParts.slice(-3).join('/');
          return relativePath;
        });
      
      newPost.files = req.files.map(file => {
        const pathParts = file.path.split(path.sep);
        const relativePath = '/' + pathParts.slice(-3).join('/');
        return {
          path: relativePath,
          originalName: file.originalname,
          fileType: getFileType(file.mimetype),
          size: file.size
        };
      });
    }
    
    // Sauvegarder le post
    await newPost.save();
    console.log("Post créé avec succès:", {
      id: newPost._id,
      content: newPost.content,
      service: newPost.service,
      status: newPost.status,
      imagesCount: newPost.images?.length || 0,
      filesCount: newPost.files?.length || 0
    });
    
    console.log("========== FIN CRÉATION POST ==========");
    
    const responsePost = {
      ...newPost.toObject(),
      images: newPost.images || [],
      files: newPost.files || [],
      reactions: newPost.getFormattedReactions(),
      totalReactions: newPost.getTotalReactions()
    };
    
    res.status(201).json(responsePost);
  } catch (err) {
    console.error("Erreur lors de la création du post:", err);
    res.status(500).json({ 
      message: "Erreur lors de la création du post", 
      error: err.message
    });
  }
});

// Route pour récupérer tous les posts approuvés - EXCLUDE LES POSTS GENERAL
router.get('/', async (req, res) => {
  try {
    console.log("========== RÉCUPÉRATION TOUS LES POSTS ==========");
    
    // CORRECTION: Récupérer seulement les posts approuvés ET qui ne sont pas 'general'
    const posts = await Post.find({ 
      status: 'approved',
      service: { $ne: 'general' } // Exclure les posts du service 'general'
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName avatar');
    
    console.log(`Posts trouvés (hors général): ${posts.length}`);
    console.log("Services des posts récupérés:", [...new Set(posts.map(p => p.service))].join(', '));
    
    const formattedPosts = posts.map(post => {
      const formatted = {
        ...post.toObject(),
        reactions: post.getFormattedReactions(),
        totalReactions: post.getTotalReactions()
      };
      
      // Ajouter l'avatar de l'utilisateur si disponible
      if (post.userId && post.userId.avatar) {
        formatted.authorAvatar = post.userId.avatar;
      }
      
      return formatted;
    });
    
    console.log("========== FIN RÉCUPÉRATION TOUS LES POSTS ==========");
    res.json(formattedPosts);
  } catch (err) {
    console.error("Erreur lors de la récupération des posts:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des posts" });
  }
});

// Route pour récupérer les posts par service - CORRIGÉE
router.get('/service/:service', async (req, res) => {
  try {
    const requestedService = req.params.service;
    console.log(`========== RÉCUPÉRATION POSTS SERVICE: ${requestedService} ==========`);
    
    // CORRECTION: Si c'est 'general', retourner un tableau vide pour le moment
    if (requestedService === 'general') {
      console.log("Service 'general' demandé - retour d'un tableau vide");
      console.log("========== FIN RÉCUPÉRATION SERVICE GENERAL ==========");
      return res.json([]);
    }
    
    // Validation du service
    const validServices = ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité'];
    if (!validServices.includes(requestedService)) {
      console.error(`Service invalide demandé: ${requestedService}`);
      return res.status(400).json({ 
        message: 'Service invalide',
        requestedService: requestedService,
        validServices: validServices
      });
    }
    
    // Débuggage - voir tous les posts disponibles
    const allPosts = await Post.find({ status: 'approved' });
    console.log(`Nombre total de posts approuvés: ${allPosts.length}`);
    console.log(`Services disponibles dans les posts: ${[...new Set(allPosts.map(p => p.service))].join(', ')}`);
    
    // Récupérer les posts du service spécifique
    const posts = await Post.find({ 
      service: requestedService,
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName avatar');
    
    console.log(`Posts trouvés pour le service "${requestedService}": ${posts.length}`);
    
    if (posts.length === 0 && allPosts.length > 0) {
      console.log('Exemples de posts disponibles:');
      allPosts.slice(0, 3).forEach((post, i) => {
        console.log(`Post ${i+1}: ID=${post._id}, Service="${post.service}", Status=${post.status}, Auteur=${post.author}`);
      });
    }
    
    const formattedPosts = posts.map(post => {
      const formatted = {
        ...post.toObject(),
        reactions: post.getFormattedReactions(),
        totalReactions: post.getTotalReactions()
      };
      
      // Ajouter l'avatar de l'utilisateur si disponible
      if (post.userId && post.userId.avatar) {
        formatted.authorAvatar = post.userId.avatar;
      }
      
      return formatted;
    });
    
    console.log(`========== FIN RÉCUPÉRATION SERVICE ${requestedService} ==========`);
    res.json(formattedPosts);
  } catch (err) {
    console.error("Erreur lors de la récupération des posts par service:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des posts" });
  }
});

// Route pour récupérer les posts en attente (admin seulement)
router.get('/pending', auth, admin, async (req, res) => {
  try {
    const pendingPosts = await Post.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName avatar');
    
    const formattedPosts = pendingPosts.map(post => {
      const formatted = {
        ...post.toObject(),
        reactions: post.getFormattedReactions(),
        totalReactions: post.getTotalReactions()
      };
      
      // Ajouter l'avatar de l'utilisateur si disponible
      if (post.userId && post.userId.avatar) {
        formatted.authorAvatar = post.userId.avatar;
      }
      
      return formatted;
    });
    
    res.json(formattedPosts);
  } catch (err) {
    console.error("Erreur lors de la récupération des posts en attente:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des posts" });
  }
});

// Route pour approuver un post avec notification
router.put('/:id/approve', auth, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }
    
    post.status = 'approved';
    post.approvedBy = req.user.id;
    post.approvedAt = Date.now();
    
    await post.save();
    
    // Envoyer des notifications par email si elles n'ont pas déjà été envoyées
    if (!post.notificationSent) {
      try {
        const users = await User.find({ 
          isActive: true,
          notificationsEnabled: true
        });
        
        if (users.length > 0) {
          console.log(`Envoi de notifications à ${users.length} utilisateurs pour le post ${post._id}`);
          await emailService.sendNewPostNotifications(post, users);
          
          post.notificationSent = true;
          await post.save();
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi des notifications:', error);
      }
    }
    
    const responsePost = {
      ...post.toObject(),
      reactions: post.getFormattedReactions(),
      totalReactions: post.getTotalReactions()
    };
    
    res.json(responsePost);
  } catch (err) {
    console.error("Erreur lors de l'approbation du post:", err);
    res.status(500).json({ message: "Erreur lors de l'approbation du post" });
  }
});

// Route pour rejeter un post avec raison
router.put('/:id/reject', auth, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }
    
    const { rejectionReason } = req.body;
    
    post.status = 'rejected';
    post.rejectionReason = rejectionReason || 'Aucune raison spécifiée';
    await post.save();
    
    const responsePost = {
      ...post.toObject(),
      reactions: post.getFormattedReactions(),
      totalReactions: post.getTotalReactions()
    };
    
    res.json(responsePost);
  } catch (err) {
    console.error("Erreur lors du rejet du post:", err);
    res.status(500).json({ message: "Erreur lors du rejet du post" });
  }
});

// Route pour télécharger un fichier spécifique
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
    const filePath = path.join(__dirname, '..', file.path.substring(1));
    
    res.download(filePath, file.originalName);
  } catch (err) {
    console.error("Erreur lors du téléchargement du fichier:", err);
    res.status(500).json({ message: "Erreur lors du téléchargement du fichier" });
  }
});

// Route pour supprimer un post (admin seulement ou propriétaire du post)
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

// Route de test pour l'upload de fichiers
router.post('/test-upload', upload.array('files', 10), (req, res) => {
  console.log("TEST UPLOAD - Requête reçue");
  console.log("TEST UPLOAD - Fichiers:", req.files);
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("Aucun fichier reçu");
  }
  
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

// Route de debug pour analyser les services des posts
router.get('/debug/services', async (req, res) => {
  try {
    const posts = await Post.find({});
    const serviceStats = {};
    
    posts.forEach(post => {
      const service = post.service || 'undefined';
      if (!serviceStats[service]) {
        serviceStats[service] = {
          count: 0,
          statuses: {},
          examples: []
        };
      }
      serviceStats[service].count++;
      
      const status = post.status || 'undefined';
      if (!serviceStats[service].statuses[status]) {
        serviceStats[service].statuses[status] = 0;
      }
      serviceStats[service].statuses[status]++;
      
      if (serviceStats[service].examples.length < 3) {
        serviceStats[service].examples.push({
          id: post._id,
          author: post.author,
          content: post.content.substring(0, 50) + '...',
          createdAt: post.createdAt
        });
      }
    });
    
    res.json({
      totalPosts: posts.length,
      serviceBreakdown: serviceStats,
      validServices: ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité', 'general']
    });
  } catch (err) {
    console.error("Erreur lors du debug des services:", err);
    res.status(500).json({ message: "Erreur lors du debug" });
  }
});

// Ajouter cette route dans server/routes/posts.js après les autres routes

// Route pour modifier un post (admin seulement)
router.put('/:id/edit', auth, admin, async (req, res) => {
  try {
    const { content, service } = req.body;
    const postId = req.params.id;
    
    // Validation du service
    const validServices = ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité', 'general'];
    if (service && !validServices.includes(service)) {
      return res.status(400).json({ 
        message: 'Service invalide', 
        validServices: validServices 
      });
    }
    
    // Trouver le post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }
    
    // Mettre à jour les champs
    if (content !== undefined) {
      post.content = content;
    }
    if (service !== undefined) {
      post.service = service;
    }
    
    // Ajouter une note de modification
    post.lastModified = {
      by: req.user.id,
      at: new Date(),
      reason: 'Modification par un administrateur'
    };
    
    await post.save();
    
    console.log(`Post ${postId} modifié par l'admin ${req.user.id}`);
    
    res.json({
      message: 'Post modifié avec succès',
      post: {
        ...post.toObject(),
        reactions: post.getFormattedReactions(),
        totalReactions: post.getTotalReactions()
      }
    });
    
  } catch (err) {
    console.error('Erreur lors de la modification du post:', err);
    res.status(500).json({ message: 'Erreur lors de la modification du post' });
  }
});

module.exports = router;