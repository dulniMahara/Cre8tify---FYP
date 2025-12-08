import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { getDesignsByDesigner } from '../../features/designs/designSlice';
import designService from '../../features/designs/designService';

const MyDesigns: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { designerDesigns, isLoading } = useSelector((state: RootState) => state.design);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user && user.token) {
            dispatch(getDesignsByDesigner(user.token));
        }
    }, [dispatch, user]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this design?') && user?.token) {
            await designService.deleteDesign(id, user.token);
            dispatch(getDesignsByDesigner(user.token)); // Refresh list
        }
    };

    if (isLoading) return <p>Loading your designs...</p>;

    return (
        <div className="my-designs-container">
            <h3>My Uploaded Designs</h3>
            <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Preview</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {designerDesigns.map((design) => (
                        <tr key={design._id}>
                            <td>
                                <img src={`/${design.imageUrl}`} alt={design.title} width="50" />
                            </td>
                            <td>{design.title}</td>
                            <td>LKR {design.price}</td>
                            <td>
                                <span className={`status-${design.status}`}>
                                    {design.status.toUpperCase()}
                                </span>
                            </td>
                            <td>
                                <button onClick={() => handleDelete(design._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MyDesigns;