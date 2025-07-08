const clothingItem = require("../models/clothingItem");

const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require("../errors/custom-errors");

const {
  SUCCESS,
  CREATED,
  // BAD_REQUEST,
  // NOT_FOUND,
  // FORBIDDEN,
  // INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const createClothingItem = (req, res, next) => {
  console.log(req.body);

  const { name, weather, imageUrl } = req.body;

  clothingItem.create( {name, weather, imageUrl, owner: req.user._id} ).then((item) => {
    console.log(item);
    res.status(CREATED).send({data:item});
  }).catch((err) => {
    console.error(err);
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid request data" ));
    }
    return next(err);
  });
};

const getClothingItems = (req, res, next) => {
  clothingItem.find({})
    .then((items) => res.status(SUCCESS).send(items))
    .catch((err) => {
      console.error(err);
      return next(err);
    });
}

const deleteClothingItem = (req, res, next) => {
  const { itemId } = req.params;

  clothingItem
    .findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        throw new ForbiddenError("You do not have permission to delete this item");
      }
      return clothingItem.findByIdAndDelete(itemId);
    })
    .then((deletedItem) => {
      res.status(SUCCESS).send({ message: "Item deleted successfully", data: deletedItem });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ForbiddenError") {
        return next(err);
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID format"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      return next(err);
    });
};

const likeItem = (req, res, next) => {
  const { itemId } = req.params;

  clothingItem.findByIdAndUpdate(itemId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((item) => {
      res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid request data"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError ("Requested resource not found"));
      }
      return next(err);
    });
}

const dislikeItem = (req, res, next) => {
  const { itemId } = req.params;

  clothingItem.findByIdAndUpdate(itemId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((item) => {
      res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid request data"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Requested resource not found"));
      }
      return next(err);
    });
}

module.exports = { createClothingItem, getClothingItems, deleteClothingItem, likeItem, dislikeItem };