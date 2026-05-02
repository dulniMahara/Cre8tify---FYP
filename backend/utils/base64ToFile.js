const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Saves a base64 string to a file and returns the relative URL.
 * If the string is not base64 or doesn't start with data:image, returns it as is.
 * @param {String} base64String 
 * @param {String} folderName 
 * @returns {String} URL path to the saved file
 */
const saveBase64ToFile = (base64String, folderName = 'products') => {
    if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:image')) {
        return base64String;
    }

    try {
        // Create folder if it doesn't exist
        const uploadDir = path.join(__dirname, '..', 'uploads', folderName);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Match base64 data
        const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return base64String;
        }

        let extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        if (extension === 'svg+xml') extension = 'svg';
        
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        
        // Generate unique filename
        const filename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;
        const filePath = path.join(uploadDir, filename);

        // Write to disk
        fs.writeFileSync(filePath, buffer);

        // Return relative URL for frontend to use
        return `/uploads/${folderName}/${filename}`;
    } catch (error) {
        console.error('Error saving base64 to file:', error);
        return base64String; // Fallback to returning original string
    }
};

module.exports = saveBase64ToFile;
