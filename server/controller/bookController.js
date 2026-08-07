import Book from "../models/Book.js";

//public GET /api/books

const getBooks = async (req, res) => {
    try{
        const books = await Book.find()
            .populate("owner", "name email")
            .populate("borrowedBy", "name email");
        
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json(
            {
            message: "Failed to fetch books",
            error: error.message  
            }
        );
    }
};

// public GET /api/books/:id

const getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate("owner", "name email")
            .populate("borrowedBy", "name email");

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json(
            {
                message: "Failed to fetch book",
                error: error.message
            }
        );
    }
};

//protected POST /api/books

const createBook = async (req, res) => {
    try {
        const { title, author, description } = req.body;

        if (!title || !author) {
            return res.status(400).json({
                message: "Title and author are required"
            });
        }

        const book = await Book.create({
            title,
            author,
            description,
            owner: req.user._id
        });

        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create book",
            error: error.message
        });
    }
};

//protected POST /api/books/:id/borrow

const borrowBook = async(req, res) => {
    try{
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(400).json(
                {
                    message: "Book not found"
                }
            );
        }

        if (!book.available) {
            return res.status(400).json(
                {
                    message: "Book is currently unavailabel"
                }
            );
        }

        if (book.owner.toString() === req.user._id.toString()) {
            return res.status(400).json(
                {
                    message: "Owner cannot be Borrower"
                }
            );
        }

        const borrowedAt = new Date();
        const returnDate = new Date(borrowedAt);
        returnDate.setMonth(returnDate.getMonth()+1);

        book.available = false;
        book.borrowedBy = req.user._id;
        book.borrowedAt = borrowedAt;
        book.returnDate = returnDate;

        await book.save();

        res.status(200).json({
            message: "Book borrowed successfully",
            book
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to borrow book",
            error: error.message
        });
    }
};


// protected PUT /api/books/:id/return

const returnBook = async(req, res) => {
    try{
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const isOwner = book.owner.toString() === req.user._id.toString();
        
        if (!isOwner) {
            return res.status(403).json({
                message: "You are not authorized for this action"
            });
        }

        book.available = true;
        book.borrowedAt = null;
        bool.borrowedBy = null;
        book.returnDate = null;

        await book.save();
        res.status(200).json({
            message: "Book has been returned",
            book
        });

    } catch(error) {
        res.status(500).json({
            message: "Failed book return",
            error: error.message
        });
    }
};

export{
    getBooks,
    getBook,
    createBook,
    borrowBook,
    returnBook
};