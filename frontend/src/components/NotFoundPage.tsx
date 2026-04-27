import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="not-found-screen">
      <div className="not-found-icon">🧩</div>
      <h1 className="not-found-title">Puzzle not found</h1>
      <p className="not-found-body">
        This page doesn't exist — maybe it's a riddle for another day.
      </p>
      <a href="/" className="not-found-link">← Back to today's puzzle</a>
    </div>
  );
}

export default NotFoundPage;
