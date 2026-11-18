import { Link } from "react-router-dom";

export default function Brand({ name = "Klexford" }: { name?: string }) {
  return <Link to="/" aria-label={name + " home"} className="wordmark">
    <span className="brand-mark" aria-hidden="true"><i/><i/></span>{name}
  </Link>;
}
