import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">

      <h1>404</h1>
      <p>Page not found</p>

      <Link to="/">Go Home</Link>

    </div>
  );
}