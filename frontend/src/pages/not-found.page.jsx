import { Link } from "react-router-dom";


export default function NotFoundPage() {
  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div className="display-1 fw-bold">
          404
        </div>

        <h1 className="h3">
          Page not found
        </h1>

        <Link
          className="btn btn-primary btn-blue mt-3"
          to="/"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}