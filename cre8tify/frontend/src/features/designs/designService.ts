import axios from 'axios';

const API_URL = '/api/designs/';

// Define the design data type (simplified)
interface Design {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    designer: string; // User ID
}

// Interface for the user object needed for token
interface User {
    token: string;
}

// --- Helper Functions ---

// Get the authorization config with the user's token
const getConfig = (token: string) => {
    return {
        headers: {
            // Note: 'multipart/form-data' is not explicitly needed here for POST, 
            // as axios handles it automatically when sending FormData, 
            // but we ensure the Authorization header is always present.
            Authorization: `Bearer ${token}`,
        },
    };
};

// 1. CREATE DESIGN
// formData is passed directly from the component (contains text fields + image file)
const createDesign = async (formData: FormData, token: string): Promise<Design> => {
    const config = getConfig(token);
    
    // POST /api/designs
    const response = await axios.post(API_URL, formData, config);
    return response.data;
};


// 2. GET DESIGNS BY DESIGNER (New API endpoint we just fixed)
const getDesignsByDesigner = async (token: string): Promise<Design[]> => {
    const config = getConfig(token);
    
    // GET /api/designs/my-designs
    const response = await axios.get(API_URL + 'my-designs', config);
    return response.data;
};

// 3. DELETE DESIGN (New function for the dashboard)
// The backend DELETE /api/designs/:id route is used here.
const deleteDesign = async (designId: string, token: string): Promise<{ id: string }> => {
    const config = getConfig(token);
    
    // DELETE /api/designs/:designId
    const response = await axios.delete(API_URL + designId, config);
    
    // Assuming backend returns { message: 'Design removed', id: '...' }
    // We only need the ID to update the Redux state
    return response.data;
};


const designService = {
    createDesign,
    getDesignsByDesigner,
    deleteDesign, // Export the new function
};

export default designService;