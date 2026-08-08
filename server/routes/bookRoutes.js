import express from "express";

import {
    getBook,
    getBooks,
    createBook,
    borrowBook,
    returnBook,
    deleteBook
} from "../controller/bookController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

//public
router.get("/", getBooks);
router.get("/:id", getBook);

//protected
router.post("/", protect, createBook);
router.post("/:id/borrow", protect, borrowBook);
router.post("/:id/return", protect, returnBook);
router.delete("/:id", protect, deleteBook);

export default router;