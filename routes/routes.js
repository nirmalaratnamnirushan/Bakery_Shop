const express = require("express");
const router = express.Router();
const Item = require('../models/users');
const multer = require('multer');
const fs = require('fs');

// Multer configuration for image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});
var upload = multer({ storage: storage });


// WEB ROUTES


// Insert a user into the database route
router.post('/add', upload.single("image"), async (req, res) => {
    try {
        const item = new Item({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: req.file.filename,
        });

        await item.save();
        req.session.message = {
            type: 'success',
            message: 'Item added successfully!',
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Get all items route
router.get("/", async (req, res) => {
    try {
        const items = await Item.find();
        res.render('index', {
            title: 'Home Page',
            items: items,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

// Render "Add Items" page
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Items" });
});

// Edit a user route
router.get('/edit/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.redirect('/');
        }
        res.render("edit_users", {
            title: "Edit User",
            items: item, // Pass the found item
        });
    } catch (err) {
        res.redirect('/');
    }
});

// Update user route
router.post('/update/:id', upload.single("image"), async (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image); // Delete the old image
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image; // Keep the old image if no new image is uploaded
    }

    try {
        await Item.findByIdAndUpdate(id, {
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: new_image,
        });
        req.session.message = {
            type: 'success',
            message: 'Item updated successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Delete user route
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;

    try {
        // Find the item by ID and delete it
        const result = await Item.findByIdAndDelete(id);

        if (result) {
            // Check if an image exists and delete it
            if (result.image) {
                try {
                    fs.unlinkSync('./uploads/' + result.image);
                } catch (err) {
                    console.log(`Error deleting image: ${err}`);
                }
            }

            // Set a success message and redirect to the home page
            req.session.message = {
                type: 'info',
                message: 'Item deleted successfully!',
            };
            res.redirect('/');
        } else {
            // If no item was found, redirect with an error message
            req.session.message = {
                type: 'danger',
                message: 'Item not found!',
            };
            res.redirect('/');
        }
    } catch (err) {
        // Handle any errors
        res.json({ message: err.message });
    }
});


// POSTMAN API ROUTES


// Create Item
router.post('/api/items', upload.single("image"), async (req, res) => {
    try {
        const item = new Item({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: req.file ? req.file.filename : null,
        });
        const savedItem = await item.save();
        res.status(201).json({ message: 'Item created successfully', data: savedItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get All Items
router.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json({ message: 'Items retrieved successfully', data: items });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Single Item by ID
router.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item retrieved successfully', data: item });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Item by ID
router.put('/api/items/:id', upload.single("image"), async (req, res) => {
    let updatedImage = req.body.old_image;
    if (req.file) {
        updatedImage = req.file.filename;
        try {
            if (req.body.old_image) {
                fs.unlinkSync('./uploads/' + req.body.old_image); // Delete old image
            }
        } catch (err) {
            console.error(err);
        }
    }

    try {
        const updatedItem = await Item.findByIdAndUpdate( 
            req.params.id,
            {
                name: req.body.name,
                price: req.body.price,
                quantity: req.body.quantity,
                image: updatedImage,
            },
            { new: true }
        );
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item updated successfully', data: updatedItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Item by ID
router.delete('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Delete associated image
        if (item.image) {
            try {
                fs.unlinkSync('./uploads/' + item.image);
            } catch (err) {
                console.error(err);
            }
        }

        res.status(200).json({ message: 'Item deleted successfully', data: item });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


