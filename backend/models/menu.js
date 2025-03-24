const mongoose = require('mongoose');         // Import Mongoose pour interagir avec MongoDB

const menuItemSchema = new mongoose.Schema({  //  Schéma pour un article du menu
    name: { type: String, required: true },   //  Nom de l'article du menu, obligatoire
    price: { type: Number, required: true },  //  Prix de l'item de menu, obligatoire
    description: String,                      //  Description de l'article

    customizations: [{                        //  Liste des personnalisations possibles pour cet article
        name: String,                         //  Nom
        options: [String],                    //  Options disponibles
        price: Number                         //  Prix du supplément
    }]
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema); // Création de la fonction 'MenuItem' basé sur le schéma défini ci-dessus

class Menu {                                   // Fonction Menu pour gérer les opérations sur lesarticles du menu
    constructor() {
        this.model = MenuItem;                 // On utilise le modèle MenuItem pour effectuer les opérations sur les articles
    }
    async addItem(item) {                      // Ajout un nouvel article dans le menu
    const newItem = new this.model(item);      // Création d'un nouvel objet basé sur le modèle MenuItem
      await newItem.save();                    // Sauvegarder un nouvel article dans la base de données
      return newItem;                          // Retourne l'article ajouté
    }

    async modifyItem(id, newItem) {            // Modifier un article existant dans le menu en utilisant son ID
        return await this.model.findByIdAndUpdate(id, newItem, { new: true }); // Recherche de l'item par son ID et met à jour 
    }

    async removeItem(id) {                     // Supprimer un article du menu par son ID
        return await this.model.findByIdAndDelete(id); // Recherche l'article par son ID et la supprimer
    }

    async addCustomization(id, customization) { // Ajouter une personnalisation à un article existant
        return await this.model.findByIdAndUpdate( // On pousse la nouvelle personnalisation dans le tableau des personnalisations
            id,
            { $push: { customizations: customization } }, // Ajout de la personnalisation
            { new: true }                       // Retourne l'objet mis à jour
        );
    }
    
    async removeCustomization(id, customizationId) { // Supprimer une personnalisation d'un article par l'ID 
        return await this.model.findByIdAndUpdate(   // Supprimer la personnalisation du tableau en utilisant son ID
            id,
            { $pull: { customizations: { _id: customizationId } } }, // Retrait de la personnalisation
            { new: true }                        // Retourne l'objet mis à jour
        );
    }

    async getMenu() {                             // Obtenir tous les articles du menu
        return await this.model.find();           // Récupère tous les articles du menu dans la base de données
    }
}

module.exports = Menu; // Export Menu
