import {
    Navigate, useLocation
} from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, permissions = [] }) {

    const location = useLocation();

    const { initializing, isAuthenticated, hasPermission } = useAuth();

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

    if(
        permissions.length > 0 &&
        !hasPermission(...permissions)
    ){
        return <Navigate to="/forbidden" replace />;
    }

    return children;

}