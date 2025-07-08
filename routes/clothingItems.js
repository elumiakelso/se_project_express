const router = require('express').Router();

const { createClothingItem, deleteClothingItem, likeItem, dislikeItem } = require('../controllers/clothingItems');

const { validateCardBody, validateItemId } = require('../middlewares/validation');

router.post('/', validateCardBody, createClothingItem);
router.delete('/:itemId', validateItemId, deleteClothingItem);
router.put('/:itemId/likes', validateItemId, likeItem);
router.delete('/:itemId/likes', validateItemId, dislikeItem);

module.exports = router;