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

module.exports = router;