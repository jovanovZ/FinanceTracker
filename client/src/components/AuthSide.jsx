import "../styles/Auth.css"
import "../index.css"

const AuthSide = () => (
  <div className="auth-side">

    <div className="auth-side-brand">
      <div className="brand-mark">F</div>
      <span>Financely</span>
    </div>

    <div className="auth-side-body">
      <p className="auth-side-quote">
        "Upload a statement on Sunday, have a clear picture of your month
        by Monday coffee. Financely replaced three spreadsheets I used to maintain."
      </p>
      <div className="auth-side-person">
        <div className="avatar">NP</div>
        <div>
          <div className="person-name">Nika Petrovič</div>
          <div className="person-title">Product Designer · Ljubljana</div>
        </div>
      </div>
    </div>

  </div>
);

export default AuthSide;