// server/routes/posts.js - Version corrigée pour l'épinglage et la visibilité des posts
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

// Route pour créer un post
router.post('/', auth, upload.array('files', 10), async (req, res) => {
  try {
    console.log("========== DÉBUT CRÉATION POST ==========");
    console.log("Corps de la requête:", req.body);
    console.log("Fichiers reçus:", req.files?.length || 0, "fichiers");
    
    const { content, title, tags, service } = req.body;
    
    const validServices = ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'comptabilité', 'general'];
    
    // Récupérer les informations de l'utilisateur
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Déterminer le service du post
    let postService = service || 'general';
    
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
      service: postService,
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
    
    // Traitement des fichiers
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

// CORRECTION: Route pour récupérer tous les posts approuvés (SANS exclure les posts du service général)
router.get('/', async (req, res) => {
  try {
    console.log("========== RÉCUPÉRATION TOUS LES POSTS ==========");
    
    // Récupérer TOUS les posts approuvés, dans l'ordre de création décroissant
    const allPosts = await Post.find({ 
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName avatar');
    
    console.log(`Posts trouvés: ${allPosts.length}`);
    
    const formattedPosts = allPosts.map(post => {
      const formatted = {
        ...post.toObject(),
        reactions: post.getFormattedReactions(),
        totalReactions: post.getTotalReactions()
      };
      
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

// CORRECTION: Route pour récupérer les posts par service
router.get('/service/:service', async (req, res) => {
  try {
    const requestedService = req.params.service;
    console.log(`========== RÉCUPÉRATION POSTS SERVICE: ${requestedService} ==========`);
    
    // Si c'est 'general', utiliser l'algorithme spécial
    if (requestedService === 'general') {
      console.log("Service 'general' demandé - redirection vers l'algorithme");
      // Rediriger vers l'endpoint de l'algorithme général
      return res.redirect('/api/posts/general-feed');
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
    
    // CORRECTION: Récupérer TOUS les posts du service, épinglés ou non
    // Les posts épinglés seront affichés en premier grâce au tri
    const servicePosts = await Post.find({ 
      service: requestedService,
      status: 'approved'
    })
      .sort({ 
        isPinned: -1,    // Posts épinglés en premier
        pinnedOrder: -1, // Puis par ordre d'épinglage
        createdAt: -1    // Puis par date de création
      })
      .populate('userId', 'firstName lastName avatar');
    
    console.log(`Posts trouvés pour le service "${requestedService}": ${servicePosts.length}`);
    
    const formattedPosts = servicePosts.map(post => {
      const formatted = {
        ...post.toObject(),
        reactions: post.getFormattedReactions(),
        totalReactions: post.getTotalReactions()
      };
      
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

// CORRECTION: Route pour récupérer les posts selon l'algorithme de la section général
router.get('/general-feed', async (req, res) => {
  try {
    console.log("========== ALGORITHME SECTION GÉNÉRAL ==========");
    
    // 1. Récupérer les posts épinglés dans 'general' (priorité absolue)
    const pinnedPosts = await Post.find({
      status: 'approved',
      isPinned: true,
      pinnedLocations: 'general'
    })
      .sort({ pinnedOrder: -1 })
      .populate('userId', 'firstName lastName avatar');

    console.log(`Posts épinglés trouvés: ${pinnedPosts.length}`);

    // 2. Récupérer les 3 derniers posts publiés (tous services confondus)
    const latestPosts = await Post.find({
      status: 'approved',
      isPinned: { $ne: true } // Exclure les posts déjà épinglés
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('userId', 'firstName lastName avatar');

    console.log(`3 derniers posts trouvés: ${latestPosts.length}`);

    // 3. Récupérer le post du mois avec le plus de réactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    console.log(`Recherche du post du mois entre ${startOfMonth} et ${endOfMonth}`);

    // Agrégation pour trouver le post avec le plus de réactions ce mois
    const topPostOfMonth = await Post.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          isPinned: { $ne: true }
        }
      },
      {
        $addFields: {
          totalReactions: {
            $add: [
              '$reactions.like.count',
              '$reactions.love.count',
              '$reactions.bravo.count',
              '$reactions.interesting.count',
              '$reactions.welcome.count'
            ]
          }
        }
      },
      {
        $match: {
          totalReactions: { $gt: 0 } // Seulement les posts avec au moins une réaction
        }
      },
      {
        $sort: { totalReactions: -1, createdAt: -1 }
      },
      {
        $limit: 1
      }
    ]);

    let topPostPopulated = null;
    if (topPostOfMonth.length > 0) {
      topPostPopulated = await Post.findById(topPostOfMonth[0]._id)
        .populate('userId', 'firstName lastName avatar');
      console.log(`Post du mois trouvé: ${topPostPopulated._id} avec ${topPostOfMonth[0].totalReactions} réactions`);
    } else {
      console.log("Aucun post avec des réactions trouvé ce mois");
    }

    // 4. Construire le feed final en évitant les doublons
    const feedPosts = [];
    const addedPostIds = new Set();

    // Ajouter les posts épinglés en premier
    pinnedPosts.forEach(post => {
      if (!addedPostIds.has(post._id.toString())) {
        feedPosts.push({
          ...post.toObject(),
          feedReason: 'pinned',
          reactions: post.getFormattedReactions(),
          totalReactions: post.getTotalReactions(),
          authorAvatar: post.userId?.avatar || null
        });
        addedPostIds.add(post._id.toString());
      }
    });

    // Ajouter le post du mois (si différent des épinglés)
    if (topPostPopulated && !addedPostIds.has(topPostPopulated._id.toString())) {
      feedPosts.push({
        ...topPostPopulated.toObject(),
        feedReason: 'top_of_month',
        reactions: topPostPopulated.getFormattedReactions(),
        totalReactions: topPostPopulated.getTotalReactions(),
        authorAvatar: topPostPopulated.userId?.avatar || null
      });
      addedPostIds.add(topPostPopulated._id.toString());
    }

    // Ajouter les 3 derniers posts (si pas déjà inclus)
    latestPosts.forEach(post => {
      if (!addedPostIds.has(post._id.toString())) {
        feedPosts.push({
          ...post.toObject(),
          feedReason: 'recent',
          reactions: post.getFormattedReactions(),
          totalReactions: post.getTotalReactions(),
          authorAvatar: post.userId?.avatar || null
        });
        addedPostIds.add(post._id.toString());
      }
    });

    // 5. Si on n'a pas assez de posts, compléter avec d'autres posts populaires
    const minPostsCount = 5;
    if (feedPosts.length < minPostsCount) {
      const additionalNeeded = minPostsCount - feedPosts.length;
      
      const additionalPosts = await Post.find({
        status: 'approved',
        isPinned: { $ne: true },
        _id: { $nin: Array.from(addedPostIds) }
      })
        .sort({ createdAt: -1 })
        .limit(additionalNeeded)
        .populate('userId', 'firstName lastName avatar');

      additionalPosts.forEach(post => {
        feedPosts.push({
          ...post.toObject(),
          feedReason: 'filler',
          reactions: post.getFormattedReactions(),
          totalReactions: post.getTotalReactions(),
          authorAvatar: post.userId?.avatar || null
        });
      });
    }

    console.log(`Feed final construit avec ${feedPosts.length} posts`);
    console.log("Répartition:", {
      pinned: feedPosts.filter(p => p.feedReason === 'pinned').length,
      topOfMonth: feedPosts.filter(p => p.feedReason === 'top_of_month').length,
      recent: feedPosts.filter(p => p.feedReason === 'recent').length,
      filler: feedPosts.filter(p => p.feedReason === 'filler').length
    });

    console.log("========== FIN ALGORITHME SECTION GÉNÉRAL ==========");

    res.json({
      posts: feedPosts,
      algorithm: {
        description: "Posts épinglés + Post du mois le plus populaire + 3 derniers posts",
        stats: {
          pinnedCount: feedPosts.filter(p => p.feedReason === 'pinned').length,
          topOfMonthCount: feedPosts.filter(p => p.feedReason === 'top_of_month').length,
          recentCount: feedPosts.filter(p => p.feedReason === 'recent').length,
          totalPosts: feedPosts.length
        },
        period: {
          monthStart: startOfMonth,
          monthEnd: endOfMonth
        }
      }
    });

  } catch (err) {
    console.error("Erreur lors de l'exécution de l'algorithme général:", err);
    res.status(500).json({ 
      message: "Erreur lors de la récupération du feed général",
      error: err.message
    });
  }
});

// Route pour obtenir des statistiques sur l'algorithme (debug/admin)
router.get('/general-stats', auth, admin, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Statistiques des posts de ce mois
    const monthlyStats = await Post.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $addFields: {
          totalReactions: {
            $add: [
              '$reactions.like.count',
              '$reactions.love.count',
              '$reactions.bravo.count',
              '$reactions.interesting.count',
              '$reactions.welcome.count'
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalReactions: { $sum: '$totalReactions' },
          avgReactions: { $avg: '$totalReactions' },
          maxReactions: { $max: '$totalReactions' },
          postsWithReactions: {
            $sum: {
              $cond: [{ $gt: ['$totalReactions', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Top 5 des posts les plus populaires du mois
    const topPostsOfMonth = await Post.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $addFields: {
          totalReactions: {
            $add: [
              '$reactions.like.count',
              '$reactions.love.count',
              '$reactions.bravo.count',
              '$reactions.interesting.count',
              '$reactions.welcome.count'
            ]
          }
        }
      },
      {
        $sort: { totalReactions: -1, createdAt: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 1,
          author: 1,
          content: { $substr: ['$content', 0, 100] },
          service: 1,
          totalReactions: 1,
          createdAt: 1
        }
      }
    ]);

    res.json({
      period: {
        start: startOfMonth,
        end: endOfMonth
      },
      monthlyStats: monthlyStats[0] || {
        totalPosts: 0,
        totalReactions: 0,
        avgReactions: 0,
        maxReactions: 0,
        postsWithReactions: 0
      },
      topPostsOfMonth,
      algorithm: {
        description: "L'algorithme sélectionne les posts épinglés, le post du mois avec le plus de réactions, et les 3 posts les plus récents",
        criteria: [
          "Posts épinglés (priorité absolue)",
          "Post du mois avec le plus de réactions",
          "3 derniers posts publiés (tous services)",
          "Posts de complément si nécessaire"
        ]
      }
    });

  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques:", err);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des statistiques",
      error: err.message
    });
  }
});

module.exports = router;