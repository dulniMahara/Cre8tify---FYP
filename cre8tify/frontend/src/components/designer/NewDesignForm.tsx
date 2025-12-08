// C:\Users\1234\Documents\FYP\cre8tify\frontend\src\components\designer\NewDesignForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store'; 
import { AuthState } from '../../features/auth/authSlice'; // Assuming you have a type for the user state

// Base API URL
const API_URL = '/api/designs';

const NewDesignForm: React.FC = () => {
    // 1. Get the user state and token from Redux (AuthSlice)
    const { user } = useSelector((state: RootState): AuthState => state.auth as AuthState); 
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    // Handler for file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFile(e.target.files[0]);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 2. Check for user and token before proceeding
        if (!user || !user.token) {
            setError('User not logged in or token is missing. Please log in again.');
            return;
        }
        
        if (!title || !description || !price || !imageFile) {
            setError('Please fill in all fields and select a file.');
            return;
        }

        // 3. Create a FormData object
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        // CRITICAL: Append the file using the field name 'image' (must match Multer setting)
        formData.append('image', imageFile); 
        
        // Configuration for the request (headers, including Authorization)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data', 
                Authorization: `Bearer ${user.token}`, // 4. Use the token from Redux
            },
        };

        try {
            const response = await axios.post(API_URL, formData, config);
            if (response.data) {
                setSuccess('Design submitted for review successfully!');
                setTimeout(() => navigate('/designer/dashboard'), 2000);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Submission failed.';
            setError(message);
        }
    };
    
    // 5. CRITICAL FIX: The component MUST return JSX
    return (
        <div className="new-design-form">
            <h2>Submit New Design</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={onSubmit}>
                <div>
                    <label>Title:</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Enter design title"
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Describe your design"
                        required
                    />
                </div>
                <div>
                    <label>Price (LKR):</label>
                    <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        placeholder="Enter price"
                        required
                    />
                </div>
                <div>
                    <label>Design File (PNG/JPG):</label>
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        accept="image/png, image/jpeg"
                        required
                    />
                </div>
                <button type="submit">Submit Design for Review</button>
            </form>
        </div>
    );
};

export default NewDesignForm;