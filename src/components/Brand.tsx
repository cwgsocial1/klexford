import { Link } from "react-router-dom";

export default function Brand() {
  return <Link to="/" aria-label="Klexford home" className="wordmark">
    <span className="brand-mark" aria-hidden="true"><i/><i/></span>Klexford
  </Link>;
}
