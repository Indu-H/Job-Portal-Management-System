import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="container-fluid vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <div className="container text-center">
        {/* Title */}
        <h1
          className="mb-5 fw-bold"
          style={{ color: "#0d6efd", fontSize: "2.8rem" }}
        >
          🚀 Job Portal Management System
        </h1>

        {/* Cards Row */}
        <div className="row justify-content-center">
          {/* User Card */}
          <div className="col-md-6 mb-4">
            <div
              className="card shadow-sm h-100 p-5"
              style={{
                borderRadius: "20px",
                cursor: "pointer",
                transition: "0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
              onClick={() => navigate("/login")}
            >
              <div className="text-center">
                <h1 style={{ fontSize: "70px" }}>👤</h1>
                <h3 className="mt-3 text-primary">User Portal</h3>
                <p className="text-muted">
                  Apply for jobs and track applications
                </p>
                <button className="btn btn-outline-primary mt-2">
                  Continue as User
                </button>
              </div>
            </div>
          </div>

          {/* Admin Card */}
          <div className="col-md-6 mb-4">
            <div
              className="card shadow-sm h-100 p-5"
              style={{
                borderRadius: "20px",
                cursor: "pointer",
                transition: "0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
              onClick={() => navigate("/admin")}
            >
              <div className="text-center">
                <h1 style={{ fontSize: "70px" }}>👨‍💼</h1>
                <h3 className="mt-3 text-dark">Admin Portal</h3>
                <p className="text-muted">
                  Manage jobs and applicants
                </p>
                <button className="btn btn-outline-dark mt-2">
                  Continue as Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;