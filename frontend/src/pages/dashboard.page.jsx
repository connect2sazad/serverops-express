import { useEffect } from "react";

import { useAuth } from "../hooks/useAuth";


export default function DashboardPage() {
  const { user } = useAuth();
  const widgets = user?.dashboard_widgets ?? [];

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

        <p className="txt-silver mb-0">
          ServerOps control-plane overview
        </p>
      </div>

      {/* signed user */}
      {/* <div className="row g-3">
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="txt-silver small">
                Signed in as
              </div>

              <div className="fw-semibold mt-1">
                {user.name || user.userid}
              </div>

              <span className="badge bg-blue text-capitalize mt-2">
                {user.role?.name || user.role?.slug}
              </span>
            </div>
          </div>
        </div>
      </div> */}

      {/* common widgets */}
      <div className="row g-3 mt-2">
        <div className="col-md-6 col-xl-4">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5 txt-blue">Today</h2>

              <p className="mb-0">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'full',
                }).format(new Date())}
              </p>

              <small className="txt-silver">
                Your local date
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-4">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5 txt-blue">My Account</h2>

              <p className="mb-1">
                {user.name || user.userid}
              </p>

              <p className="txt-silver mb-0">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-4">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5 txt-blue">Getting Started</h2>

              <p className="txt-silver mb-0">
                Use the sidebar to open the tools available
                to your account. Contact your administrator
                if you need additional access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* permission controlled widgets */}
      <div className="row g-3 mt-2">
        {widgets.length === 0 ? (
          <div className="col-12">
            <p className="txt-red">
              No operational widgets are available for your account.
            </p>
          </div>
        ) : (
          widgets.map(widget => (
            <div
              className="col-md-6 col-xl-4"
              key={widget.key}
            >
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="h5 txt-blue">{widget.title}</h2>

                  <p className="txt-silver mb-0">
                    Widget data is not connected yet.
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}