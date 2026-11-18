import { Link } from "react-router-dom";

export default function Brand() {
  return <Link to="/" aria-label="Klexford home" className="wordmark">
    <span className="brand-emblem" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 22.5}deg)` }} />)}
    </span>Klexford
  </Link>;
}
