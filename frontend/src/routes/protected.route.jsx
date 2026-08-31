import {
    Navigate, useLocation
} from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {

    const location = useLocation();

    const { initializing, isAuthenticated } = useAuth();

    if (initializing) {
        return (
            <>
                <div className="min-vh-100 d-flex align-items-center justify-content-center">
                    <div className="spinner-border" role='status'>
                        <span className="visually-hidden">Loading session...</span>
                    </div>
                </div>
            </>
        );
    }

    if(!isAuthenticated){
        return(
            <>
                <Navigate to="/login" replace state={{
                    from: location,
                }}
                />
            </>
        );
    }

    return children;

}