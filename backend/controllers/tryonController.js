const { client, handle_file } = require('@gradio/client');

const generateTryOn = async (req, res) => {
    try {
        if (!req.files || !req.files.humanImage || !req.files.garmImage) {
            return res.status(400).json({ error: 'Both humanImage and garmImage are required' });
        }

        const humanImageFile = req.files.humanImage[0];
        const garmImageFile = req.files.garmImage[0];

        // The @gradio/client handle_file accepts a Blob for NodeJS environments
        const humanBlob = handle_file(new Blob([humanImageFile.buffer], { type: humanImageFile.mimetype }));
        const garmBlob = handle_file(new Blob([garmImageFile.buffer], { type: garmImageFile.mimetype }));

        console.log("Connecting to Hugging Face yisol/IDM-VTON Space...");
        const app = await client("yisol/IDM-VTON");

        console.log("Submitting images to IDM-VTON...");
        
        // Gradio predict endpoint /tryon 
        // Inputs: [human_img_dict, garm_img, garment_des, is_checked, is_checked_crop, denoise_steps, seed]
        const output = await app.predict("/tryon", [
            { background: humanBlob, layers: [], composite: null }, // dict
            garmBlob, // image
            req.body.garmentDes || "t-shirt", // string
            true, // is_checked
            true, // is_checked_crop 
            30, // denoise_steps
            42, // seed
        ]);

        console.log("Gradio IDM-VTON generation complete!");

        const resultItem = output.data[0]; 
        let resultUrl = resultItem;
        
        if (typeof resultItem === 'object' && resultItem !== null) {
            resultUrl = resultItem.url || resultItem.path;
        }

        res.json({ success: true, imageUrl: resultUrl });
    } catch (error) {
        console.error("Virtual Try-On Error:", error);
        res.status(500).json({ error: error.message || "Failed to generate try-on preview via Hugging Face" });
    }
};

module.exports = { generateTryOn };
