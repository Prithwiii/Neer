// Shared bits for the lost and found board. The lists match the enums in
// server/models/LostFoundPost.js.

export const LOST_FOUND_TYPES = ["Lost", "Found"];

export const ITEM_CATEGORIES = [
    "Electronics",
    "Clothing",
    "Keys",
    "Wallet/ID",
    "Accessories",
    "Documents",
    "Other"
];

export const POST_STATUSES = ["Active", "Returned"];

// reuses the .cat-* colour tints the building layout already defines
const CATEGORY_CLASS = {
    Electronics: "elevator",
    Clothing: "staircase",
    Keys: "facility",
    "Wallet/ID": "flat",
    Accessories: "parking",
    Documents: "exit",
    Other: "other"
};

export const categoryClass = (category) => CATEGORY_CLASS[category] || "other";

// "2026-09-03"
export const getToday = () => new Date().toISOString().slice(0, 10);

// "September 2, 2026"
export const formatDate = (date) => {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

// The project has no file upload, so a picture is shrunk here in the browser
// and sent with the post as a data URI. Anything bigger than MAX_SIDE is scaled
// down and re-encoded as a JPEG, which keeps a phone photo well under the
// limit the server accepts.
const MAX_SIDE = 900;
const JPEG_QUALITY = 0.7;

export const readImageFile = (file) =>
    new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Please choose an image file"));
            return;
        }

        const reader = new FileReader();

        reader.onerror = () => reject(new Error("Could not read that file"));

        reader.onload = () => {
            const image = new Image();

            image.onerror = () => reject(new Error("Could not read that image"));

            image.onload = () => {
                const scale = Math.min(
                    1,
                    MAX_SIDE / Math.max(image.width, image.height)
                );

                const canvas = document.createElement("canvas");
                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);

                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
            };

            image.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
