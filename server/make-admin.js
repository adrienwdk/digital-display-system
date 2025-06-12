const mongoose = require('mongoose');
const User = require('./models/User'); // Ajustez le chemin selon votre structure

// URL de connexion à MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/digital_display_system';

// Fonction pour créer un administrateur
const createAdmin = async (email) => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connecté avec succès!');
    
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`Aucun utilisateur trouvé avec l'email: ${email}`);
      process.exit(1);
    }
    
    // Promouvoir l'utilisateur en admin
    user.isAdmin = true;
    await user.save();
    
    console.log(`L'utilisateur ${user.firstName} ${user.lastName} (${user.email}) est maintenant administrateur!`);
    
    // Fermer la connexion à MongoDB
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
    
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
};

// Vérifier si un email a été fourni
if (process.argv.length < 3) {
  console.log('Veuillez fournir l\'email de l\'utilisateur à promouvoir:');
  console.log('node make-admin.js email@example.com');
  process.exit(1);
}

// Récupérer l'email depuis les arguments
const email = process.argv[2];

// Exécuter la fonction
createAdmin(email);

// COMMENT UTILISER CE SCRIPT:
// 1. Sauvegardez ce fichier sous le nom "make-admin.js" dans le répertoire de votre serveur
// 2. Assurez-vous que les chemins d'importation sont corrects pour votre projet
// 3. Exécutez la commande: node make-admin.js email@exemple.com
// 4. Redémarrez votre application pour que les changements prennent effet