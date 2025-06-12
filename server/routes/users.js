const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // Assurez-vous d'importer le middleware admin si ce n'est pas déjà fait
const User = require('../models/User');

// GET /api/users - Obtenir tous les utilisateurs
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// GET /api/users/me - Obtenir le profil de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// PUT /api/users/notifications - Mettre à jour les préférences de notification
router.put('/notifications', auth, async (req, res) => {
  try {
    const { notificationsEnabled } = req.body;
    
    // Vérifier si la valeur est un booléen
    if (typeof notificationsEnabled !== 'boolean') {
      return res.status(400).json({ message: 'La valeur doit être un booléen (true/false)' });
    }
    
    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { notificationsEnabled }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({ 
      message: `Notifications ${notificationsEnabled ? 'activées' : 'désactivées'} avec succès`, 
      user 
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour des préférences de notification:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/users/department - Mettre à jour le département de l'utilisateur
router.put('/department', auth, async (req, res) => {
  try {
    const { department } = req.body;
    
    // Vérifier si le département est valide
    const validDepartments = ['marketing', 'commerce', 'achat', 'informatique', 'logistique', 'rh', 'compta'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ 
        message: 'Département invalide',
        validDepartments
      });
    }
    
    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { department }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({
      message: `Département mis à jour avec succès: ${department}`,
      user
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du département:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/users/:id - Mettre à jour un utilisateur (admin seulement)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { firstName, lastName, email, department, isAdmin, role, isActive } = req.body;
    
    // Construire l'objet de mise à jour
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (department) {
      const validDepartments = ['marketing', 'rh', 'technique', 'finance', 'direction', 'autre'];
      if (!validDepartments.includes(department)) {
        return res.status(400).json({ 
          message: 'Département invalide',
          validDepartments
        });
      }
      updateFields.department = department;
    }
    if (isAdmin !== undefined) updateFields.isAdmin = isAdmin;
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;
    
    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: updateFields }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/users/:id - Supprimer un utilisateur (admin seulement)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    await user.deleteOne();
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;