const clothingItem = require("../models/clothingItem");

const {
  SUCCESS,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const createClothingItem = (req, res) => {
  console.log(req.body);

  const { name, weather, imageUrl } = req.body;

  clothingItem.create( {name, weather, imageUrl, owner: req.user._id} ).then((item) => {
    console.log(item);
    res.status(CREATED).send({data:item});
  }).catch((err) => {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({ message: "Invalid request data" });
    }
    return res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
  });
};

const getClothingItems = (req, res) => {
  clothingItem.find({})
    .then((items) => res.status(SUCCESS).send(items))
    .catch((err) => {
      console.error(err);
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
    });
}

const deleteClothingItem = (req, res) => {
  const { itemId } = req.params;

  clothingItem
    .findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        const error = new Error("You do not have permission to delete this item");
        error.name = "ForbiddenError";
        throw error;
      }
    })
    .then(() => {
      return clothingItem.findByIdAndDelete(itemId);
    })
    .then((deletedItem) => {
      res.status(SUCCESS).send({ message: "Item deleted successfully", data: deletedItem });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ForbiddenError") {
        return res.status(FORBIDDEN).send({ message: "You do not have permission to delete this item" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID format" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
    });
};

const likeItem = (req, res) => {
  const { itemId } = req.params;

  clothingItem.findByIdAndUpdate(itemId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((item) => {
      res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid request data" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Requested resource not found" });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
    });
}

const dislikeItem = (req, res) => {
  const { itemId } = req.params;

  clothingItem.findByIdAndUpdate(itemId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((item) => {
      res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid request data" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Requested resource not found" });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
    });
}

module.exports = { createClothingItem, getClothingItems, deleteClothingItem, likeItem, dislikeItem };