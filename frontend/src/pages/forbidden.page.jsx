import { Link } from "react-router-dom";

export default function ForbiddenPage() {

    return (
        <main className="min-vh-100 d-flex align-items-center justify-content-center bg-light">

            <div className="text-center">

                <div className="display-1 fw-bold">403</div>

                <h1 className="h3">Access denied</h1>

                <p className="text-secondary">You don't have permission to view this page</p>

                <Link to="/" className="btn btn-primary">
                    Return to dashboard
                </Link>

            </div>

        </main>
    );

}