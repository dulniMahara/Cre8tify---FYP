const FASHN_API_KEY = process.env.FASHN_API_KEY;
const FASHN_BASE_URL = 'https://api.fashn.ai/v1';

// Helper: Convert buffer to base64 with proper data URI prefix
function bufferToBase64(buffer, mimetype) {
    return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

// Helper: Poll FASHN every 2s until completed or failed (max 60s)
async function pollFashnResult(predictionId) {
    const maxAttempts = 30; // 30 × 2s = 60s

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const statusRes = await fetch(`${FASHN_BASE_URL}/status/${predictionId}`, {
            headers: { 'Authorization': `Bearer ${FASHN_API_KEY}` }
        });

        const statusData = await statusRes.json();
        console.log(`[FASHN] Poll ${attempt + 1}/${maxAttempts}: ${statusData.status}`);

        if (statusData.status === 'completed') {
            return { success: true, imageUrl: statusData.output[0] };
        }

        if (statusData.status === 'failed') {
            return { success: false, error: statusData.error?.message || 'FASHN generation failed' };
        }

        // 'starting' | 'in_queue' | 'processing' → keep polling
    }

    return { success: false, error: 'Timed out waiting for FASHN result (60s)' };
}

const generateTryOn = async (req, res) => {
    try {
        if (!req.files || !req.files.humanImage || !req.files.garmImage) {
            return res.status(400).json({ error: 'Both humanImage and garmImage are required' });
        }

        const humanImageFile = req.files.humanImage[0];
        const garmImageFile  = req.files.garmImage[0];

        console.log('[FASHN] Starting virtual try-on...');

        // Convert uploaded buffers to base64 data URIs (no cloud storage needed)
        const modelImageBase64   = bufferToBase64(humanImageFile.buffer, humanImageFile.mimetype);
        const garmentImageBase64 = bufferToBase64(garmImageFile.buffer,  garmImageFile.mimetype);

        // Step 1 — Submit the job
        const runRes = await fetch(`${FASHN_BASE_URL}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FASHN_API_KEY}`
            },
            body: JSON.stringify({
                model_name: 'tryon-v1.6',
                inputs: {
                    model_image:        modelImageBase64,
                    garment_image:      garmentImageBase64,
                    category:           'tops',      // your project is t-shirts only
                    garment_photo_type: 'flat-lay',  // your garments are flat mockup images
                    mode:               'balanced',  // 'performance'(5s)|'balanced'(8s)|'quality'(17s)
                    output_format:      'jpeg',      // faster delivery for real-time preview
                    return_base64:      false        // returns a CDN URL valid for 72 hours
                }
            })
        });

        const runData = await runRes.json();

        if (!runRes.ok || runData.error) {
            console.error('[FASHN] Job submission failed:', runData);
            return res.status(500).json({
                error: runData.message || runData.error || 'Failed to start FASHN job'
            });
        }

        console.log(`[FASHN] Job submitted. ID: ${runData.id}`);

        // Step 2 — Poll until done
        const result = await pollFashnResult(runData.id);

        if (result.success) {
            console.log('[FASHN] ✅ Complete:', result.imageUrl);
            return res.json({ success: true, imageUrl: result.imageUrl });
        } else {
            console.error('[FASHN] ❌ Failed:', result.error);
            return res.status(500).json({ error: result.error });
        }

    } catch (error) {
        console.error('[FASHN] Unexpected error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate try-on preview' });
    }
};

module.exports = { generateTryOn };
