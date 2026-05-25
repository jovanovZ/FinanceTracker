import CategoryModel from "../models/Category.js";

const CategoryController = {
    async create(req, res) {
        const { name } = req.body;
        const newCategory = new CategoryModel({ name });
        try {
            const result = await newCategory.save();
            return res.status(200).json(result);
        } catch (err) {
            console.error("Error in create note:", err);
            return res.status(500).send("Error while creating category.");
        }
    },
    async list(req, res) {
        try {
            const categories = await CategoryModel.find();
            return res.status(200).json(categories);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error while getting category list.");
        }
    },


    async show(req, res) {
        const categoryId = req.params.id;
        try {
            const category = await CategoryModel.findById(categoryId);
            if (!category) return res.status(404).send("doesnt exist");
            return res.status(200).json(note);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error while getting category by id.");
        }
    },

    async update(req, res) {
        try {
            const updatedCategory = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
            res.status(200).json(updatedCategory);
        } catch (err) {
            res.status(400).send("Error while updating category")
        }
    },
    async remove(req, res) {
        const categoryId = req.params.id
        try {
            const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
            if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });
            res.status(200).json({ message: 'Category deleted' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};
let update = CategoryController.update, remove = CategoryController.remove, create = CategoryController.create, list = CategoryController.list, show = CategoryController.show;

export default CategoryController;
