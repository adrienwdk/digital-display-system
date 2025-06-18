const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Post = require('../models/Post');

// Route pour promouvoir un utilisateur au rang d'administrateur
router.put('/users/:id/promote', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    user.isAdmin = true;
    await user.save();
    
    res.json({
      message: "L'utilisateur a été promu administrateur",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error("Erreur lors de la promotion de l'utilisateur:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour rétrograder un administrateur
router.put('/users/:id/demote', auth, admin, async (req, res) => {
  try {
    // Vérifier qu'on ne rétrograde pas le dernier administrateur
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1) {
      return res.status(400).json({ 
        message: "Impossible de rétrograder le dernier administrateur" 
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Ne pas permettre à un admin de se rétrograder lui-même
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ 
        message: "Vous ne pouvez pas vous rétrograder vous-même" 
      });
    }
    
    user.isAdmin = false;
    await user.save();
    
    res.json({
      message: "L'utilisateur n'est plus administrateur",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error("Erreur lors de la rétrogradation de l'administrateur:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour récupérer tous les utilisateurs (admin seulement)
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour obtenir des statistiques (admin seulement)
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const pendingPostsCount = await Post.countDocuments({ status: 'pending' });
    const approvedPostsCount = await Post.countDocuments({ status: 'approved' });
    const rejectedPostsCount = await Post.countDocuments({ status: 'rejected' });
    
    res.json({
      users: userCount,
      posts: {
        pending: pendingPostsCount,
        approved: approvedPostsCount,
        rejected: rejectedPostsCount,
        total: pendingPostsCount + approvedPostsCount + rejectedPostsCount
      }
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get('/posts', auth, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status; // 'all', 'pending', 'approved', 'rejected'
    const service = req.query.service;
    const search = req.query.search;
    
    // Construire le filtre
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (service && service !== 'all') {
      filter.service = service;
    }
    
    if (search) {
      filter.$or = [
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Compter le total
    const total = await Post.countDocuments(filter);
    
    // Récupérer les posts avec pagination
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('userId', 'firstName lastName email avatar')
      .populate('approvedBy', 'firstName lastName')
      .populate('lastModified.by', 'firstName lastName');
    
    // Formater les posts
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
    
    res.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (err) {
    console.error("Erreur lors de la récupération des posts:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour supprimer définitivement un post (admin seulement)
router.delete('/posts/:id', auth, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }
    
    // Supprimer les fichiers associés
    if (post.files && post.files.length > 0) {
      const path = require('path');
      const fs = require('fs');
      
      post.files.forEach(file => {
        const filePath = path.join(__dirname, '../..', file.path.substring(1));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Fichier supprimé: ${filePath}`);
        }
      });
    }
    
    await post.deleteOne();
    
    res.json({ message: "Post supprimé définitivement" });
    
  } catch (err) {
    console.error("Erreur lors de la suppression du post:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;