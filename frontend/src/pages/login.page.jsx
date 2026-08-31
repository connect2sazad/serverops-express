import {
  useEffect, useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  Navigate, useLocation, useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../schemas/auth.schema";
import { getErrorMessage } from "../exceptions/errors";


export default function LoginPage() {

  // navigation objects
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login, isAuthenticated, initializing,
  } = useAuth();

  const [serverError, setServerError] = useState("");

  const {
    register, handleSubmit, formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userid: "",
      password: "",
    },
  });

  useEffect(() => {
    document.title = "Login | ServerOps";
  }, []);


  if (initializing) {
    return (
      <main className="min-vh-100 d-flex align-items-center justify-content-center">
        <p role="status">Loading session...</p>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values) {
    setServerError("");

    try {
      await login(
        values.userid,
        values.password
      );

      const destination =
        location.state?.from?.pathname ||
        "/";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      if(error.status != 200){

        setServerError(   
          "Username or Password is incorrect!"
        );
      }
    }
  }

  return (
    <main className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-7 col-lg-5 col-xl-4">
            <div className="border border-primary">
              <div className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="fs-1">
                    <i className="bi bi-server txt-blue" />
                  </div>

                  <h1 className="h3 fw-bold txt-blue">
                    ServerOps
                  </h1>

                  <p className="txt-blue mb-0">
                    Sign in to continue
                  </p>
                </div>

                {serverError && (
                  <div
                    className="alert alert-danger"
                    role="alert"
                  >
                    {serverError}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit(
                    onSubmit
                  )}
                  noValidate
                >
                  <div className="mb-3">
                    <label
                      className="form-label txt-blue"
                      htmlFor="userid"
                    >
                      Username
                    </label>

                    <input
                      id="userid"
                      autoComplete="userid"
                      className={`form-control ${errors.userid
                        ? "is-invalid"
                        : ""
                        }`}
                      {...register("userid")}
                    />

                    <div className="invalid-feedback">
                      {errors.userid?.message}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      className="form-label txt-blue"
                      htmlFor="password"
                    >
                      Password
                    </label>

                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className={`form-control ${errors.password
                        ? "is-invalid"
                        : ""
                        }`}
                      {...register("password")}
                    />

                    <div className="invalid-feedback">
                      {errors.password?.message}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-blue w-100"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Signing in..."
                      : "Sign in"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}