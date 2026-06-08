import CategoryModel from "../models/Category.js";

const CategoryController = {
    async create(req, res) {
        console.log(req.user)
        const userId = req.user._id;
        const { name } = req.body;
        console.log(userId)
        const newCategory = new CategoryModel({ name: name, user_id: userId });
        try {
            const result = await newCategory.save();
            return res.status(200).json(result);
        } catch (err) {
            console.error("Error in create note:", err);
            return res.status(500).send("Error while creating category.");
        }
    },
    async list(req, res) {
        const userId = req.user._id;;
        console.log("in category list, user id: ",userId);
        try {
            const categories = await CategoryModel.find({ user_id: userId });
            return res.status(200).json(categories);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error while getting category list.");
        }
    },


    async show(req, res) {
        const categoryId = req.params.id;
        const userId = req.user._id;;
        console.log(userId)
        try {
            const category = await CategoryModel.findOne({ _id: categoryId, user_id: userId});
            if (!category) return res.status(404).send("doesnt exist");
            return res.status(200).json(category);
        } catch (err) {
            console.error(err);
            return res.status(500).send("Error while getting category by id.");
        }
    },

    async update(req, res) {
        const userId = req.user._id;;
        const categoryId = req.params.id;
        try {
            const updatedCategory = await CategoryModel.findOneAndUpdate({_id: categoryId, user_id: userId}, req.body, { new: true });
            if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
            res.status(200).json(updatedCategory);
        } catch (err) {
            res.status(400).send("Error while updating category")
        }
    },
    async remove(req, res) {
        const userId = req.user._id;;
        const categoryId = req.params.id
    
        try {
            const deletedCategory = await CategoryModel.findOneAndDelete({_id: categoryId, user_id: userId });
            if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });
            res.status(200).json({ message: 'Category deleted' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};
let update = CategoryController.update, remove = CategoryController.remove, create = CategoryController.create, list = CategoryController.list, show = CategoryController.show;

export default CategoryController;
