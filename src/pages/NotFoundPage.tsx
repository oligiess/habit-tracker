import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="px-8 py-6 flex flex-col gap-3">
      <h1 className="text-xl leading-tight text-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
        Page not found
      </h1>
      <p className="text-sm text-muted-foreground">This page doesn't exist.</p>
      <Link to="/" className="text-sm text-primary hover:underline w-fit">
        Back to dashboard
      </Link>
    </div>
  );
}
