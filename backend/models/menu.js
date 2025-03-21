const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    customizations: [{
        name: String,
        options: [String],
        price: Number
    }]
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

class Menu {
    constructor() {
        this.model = MenuItem;
    }

    async addItem(item) {
        const newItem = new this.model(item);
        await newItem.save();
        return newItem;
    }

    async modifyItem(id, newItem) {
        return await this.model.findByIdAndUpdate(id, newItem, { new: true });
    }

    async removeItem(id) {
        return await this.model.findByIdAndDelete(id);
    }

    async addCustomization(id, customization) {
        return await this.model.findByIdAndUpdate(
            id,
            { $push: { customizations: customization } },
            { new: true }
        );
    }

    async removeCustomization(id, customizationId) {
        return await this.model.findByIdAndUpdate(
            id,
            { $pull: { customizations: { _id: customizationId } } },
            { new: true }
        );
    }

    async getMenu() {
        return await this.model.find();
    }
}

module.exports = Menu;