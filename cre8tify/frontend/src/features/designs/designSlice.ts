import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import designService from './designService';

// Define the shape of a single design (must match the service definition)
export interface Design {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    designer: string;
    // Add other fields as needed
}

// Define the initial state structure for the designs slice
interface DesignState {
    designs: Design[]; // For public viewing (optional, but good practice)
    designerDesigns: Design[]; // CRITICAL: Holds designs for the logged-in designer
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    message: string;
}

const initialState: DesignState = {
    designs: [],
    designerDesigns: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// --- Async Thunks ---

// 1. Thunk for Creating a Design (used by NewDesignForm)
export const createDesign = createAsyncThunk<
    Design, // Return type
    { formData: FormData; token: string }, // Argument type
    { rejectValue: string } // ThunkAPI extra
>('designs/create', async ({ formData, token }, thunkAPI) => {
    try {
        return await designService.createDesign(formData, token);
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});


// 2. Thunk for Fetching Designer's Designs (used by MyDesigns component)
export const getDesignsByDesigner = createAsyncThunk<
    Design[], // Return type (array of designs)
    string, // Argument type (token)
    { rejectValue: string }
>('designs/getDesignerDesigns', async (token, thunkAPI) => {
    try {
        return await designService.getDesignsByDesigner(token);
    } catch (error: any) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});


// --- Slice Definition ---

export const designSlice = createSlice({
    name: 'design',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            // --- createDesign ---
            .addCase(createDesign.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createDesign.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.designerDesigns.unshift(action.payload); // Add new design to the designer's list
                state.message = 'Design submitted successfully.';
            })
            .addCase(createDesign.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
            })
            // --- getDesignsByDesigner ---
            .addCase(getDesignsByDesigner.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getDesignsByDesigner.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.designerDesigns = action.payload; // Set the designs list
                state.message = '';
            })
            .addCase(getDesignsByDesigner.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
                state.designerDesigns = []; // Clear list on failure
            });
    },
});

export const { reset } = designSlice.actions;
export default designSlice.reducer;