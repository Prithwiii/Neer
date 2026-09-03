import mongoose from "mongoose";

import LostFoundPost, {
    LOST_FOUND_TYPES,
    ITEM_CATEGORIES,
    POST_STATUSES
} from "../models/LostFoundPost.js";

// the board only ever shows who posted an item by name and flat, never an
// email or any other private contact detail
const POSTER_FIELDS = "username flatNumber";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// a picture is stored inline as a data URI, so it has to be kept small
const IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_IMAGE_LENGTH = 400000;

// makes a search term safe to drop into a regular expression
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// validates and cleans the fields shared by creating and editing a post
const readPostInput = (body) => {
    const itemName = typeof body.itemName === "string" ? body.itemName.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const description =
        typeof body.description === "string" ? body.description.trim() : "";
    const date = typeof body.date === "string" ? body.date.trim() : "";
    const image = typeof body.image === "string" ? body.image.trim() : "";
    const category = body.category === undefined ? "Other" : body.category;

    if (!LOST_FOUND_TYPES.includes(body.type)) {
        return { error: "Choose whether the item was lost or found" };
    }

    if (!itemName) {
        return { error: "Item name is required" };
    }

    if (itemName.length > 60) {
        return { error: "Item name must be 60 characters or less" };
    }

    if (!ITEM_CATEGORIES.includes(category)) {
        return { error: "A valid category is required" };
    }

    if (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date))) {
        return { error: "A valid date is required" };
    }

    // a lost or found item cannot have happened in the future
    if (date > new Date().toISOString().slice(0, 10)) {
        return { error: "The date cannot be in the future" };
    }

    if (!location) {
        return { error: "Location is required" };
    }

    if (location.length > 80) {
        return { error: "Location must be 80 characters or less" };
    }

    if (!description) {
        return { error: "Description is required" };
    }

    if (description.length > 500) {
        return { error: "Description must be 500 characters or less" };
    }

    if (image) {
        if (!IMAGE_PATTERN.test(image)) {
            return { error: "The picture must be a PNG, JPEG or WEBP image" };
        }

        if (image.length > MAX_IMAGE_LENGTH) {
            return { error: "The picture is too large, please choose a smaller one" };
        }
    }

    return {
        values: {
            type: body.type,
            itemName,
            category,
            date,
            location,
            description,
            image
        }
    };
};

// Loads a post and checks the signed in user may change it. Only the person who
// posted it can edit or resolve it. Committee members may also delete a post,
// which is how the board is moderated.
const loadPostForUser = async (postId, user, { allowCommittee = false } = {}) => {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return { status: 404, message: "Post not found" };
    }

    const post = await LostFoundPost.findById(postId);

    if (!post) {
        return { status: 404, message: "Post not found" };
    }

    const isOwner = post.postedBy.toString() === user._id.toString();
    const isCommittee = allowCommittee && user.role === "committee";

    if (!isOwner && !isCommittee) {
        return {
            status: 403,
            message: "You can only manage your own lost and found posts"
        };
    }

    return { post, isOwner };
};

// GET the board, with an optional search term and filters
export const getLostFoundPosts = async (req, res) => {
    try {
        const filter = {};

        const { type, category, status } = req.query;

        if (type && type !== "All") {
            if (!LOST_FOUND_TYPES.includes(type)) {
                return res.status(400).json({ message: "A valid type is required" });
            }

            filter.type = type;
        }

        if (category && category !== "All") {
            if (!ITEM_CATEGORIES.includes(category)) {
                return res
                    .status(400)
                    .json({ message: "A valid category is required" });
            }

            filter.category = category;
        }

        if (status && status !== "All") {
            if (!POST_STATUSES.includes(status)) {
                return res.status(400).json({ message: "A valid status is required" });
            }

            filter.status = status;
        }

        const search =
            typeof req.query.search === "string" ? req.query.search.trim() : "";

        if (search) {
            if (search.length > 60) {
                return res
                    .status(400)
                    .json({ message: "Search term must be 60 characters or less" });
            }

            // one term is matched against the fields a resident would look in
            const pattern = new RegExp(escapeRegex(search), "i");

            filter.$or = [
                { itemName: pattern },
                { description: pattern },
                { location: pattern },
                { category: pattern }
            ];
        }

        // the picture is left out here, the board would be very heavy with it
        const posts = await LostFoundPost.find(filter)
            .select("-image")
            .populate("postedBy", POSTER_FIELDS)
            .sort({ createdAt: -1 })
            .lean();

        // a small count so the board can show what is still open
        const activeCount = posts.filter((post) => post.status === "Active").length;

        res.status(200).json({
            posts,
            summary: {
                total: posts.length,
                active: activeCount,
                returned: posts.length - activeCount
            }
        });
    } catch (error) {
        console.error("Error fetching lost and found posts:", error);
        res.status(500).json({
            message: "Failed to fetch the lost and found board"
        });
    }
};

// GET one post, picture included
export const getLostFoundPost = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Post not found" });
        }

        const post = await LostFoundPost.findById(req.params.id)
            .populate("postedBy", POSTER_FIELDS)
            .lean();

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching a lost and found post:", error);
        res.status(500).json({
            message: "Failed to fetch the post"
        });
    }
};

// POST a new lost or found item
export const createLostFoundPost = async (req, res) => {
    try {
        const { error, values } = readPostInput(req.body);

        if (error) {
            return res.status(400).json({ message: error });
        }

        const post = await LostFoundPost.create({
            ...values,
            postedBy: req.user._id
        });

        await post.populate("postedBy", POSTER_FIELDS);

        res.status(201).json(post);
    } catch (error) {
        console.error("Error creating a lost and found post:", error);
        res.status(500).json({
            message: "Failed to create the post"
        });
    }
};

// PUT an existing post, the poster only
export const updateLostFoundPost = async (req, res) => {
    try {
        const found = await loadPostForUser(req.params.id, req.user);

        if (found.status) {
            return res.status(found.status).json({ message: found.message });
        }

        const { error, values } = readPostInput(req.body);

        if (error) {
            return res.status(400).json({ message: error });
        }

        found.post.set(values);
        await found.post.save();
        await found.post.populate("postedBy", POSTER_FIELDS);

        res.status(200).json(found.post);
    } catch (error) {
        console.error("Error updating a lost and found post:", error);
        res.status(500).json({
            message: "Failed to save the post"
        });
    }
};

// PATCH the status, used to mark an item returned and to reopen it if that was
// done by mistake. Only the person who posted it can do either.
export const setLostFoundStatus = (nextStatus) => async (req, res) => {
    try {
        const found = await loadPostForUser(req.params.id, req.user);

        if (found.status) {
            return res.status(found.status).json({ message: found.message });
        }

        if (found.post.status === nextStatus) {
            return res.status(400).json({
                message: `This post is already marked as ${nextStatus.toLowerCase()}`
            });
        }

        found.post.status = nextStatus;
        found.post.resolvedAt = nextStatus === "Returned" ? new Date() : null;

        await found.post.save();
        await found.post.populate("postedBy", POSTER_FIELDS);

        res.status(200).json(found.post);
    } catch (error) {
        console.error("Error updating the status of a post:", error);
        res.status(500).json({
            message: "Failed to update the status of the post"
        });
    }
};

// DELETE a post. The poster can remove their own, and a committee member can
// remove any post so the board can be kept tidy.
export const deleteLostFoundPost = async (req, res) => {
    try {
        const found = await loadPostForUser(req.params.id, req.user, {
            allowCommittee: true
        });

        if (found.status) {
            return res.status(found.status).json({ message: found.message });
        }

        await found.post.deleteOne();

        res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        console.error("Error deleting a lost and found post:", error);
        res.status(500).json({
            message: "Failed to delete the post"
        });
    }
};
