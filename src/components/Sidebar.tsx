const Sidebar = () => {
  return (
    <aside className="space-y-6">
      {/* Stats Card */}
      <div className="bg-gradient-to-br from-primary to-journal-blue-light rounded-lg p-5 text-primary-foreground">
        <h3 className="font-heading font-bold mb-4">Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Total Articles</span>
            <span className="font-bold">1,424</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Authors</span>
            <span className="font-bold">762</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Countries</span>
            <span className="font-bold">78</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-primary-foreground/80">Avg. Impact Factor</span>
            <span className="font-bold">7.5</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
