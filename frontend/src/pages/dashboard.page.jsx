import { useEffect } from "react";

import { useAuth } from "../hooks/useAuth";


export default function DashboardPage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title =
      "Dashboard | ServerOps";
  }, []);

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">
          Dashboard
        </h1>

        <p className="text-secondary mb-0">
          ServerOps control-plane overview
        </p>
      </div>

      <div className="row g-3">
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="text-secondary small">
                Signed in as
              </div>

              <div className="fw-semibold mt-1">
                {user.username}
              </div>

              <span className="badge text-bg-dark text-capitalize mt-2">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}