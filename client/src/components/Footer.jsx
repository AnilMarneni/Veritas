export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Veritas Marketplace. Built for SDE Internship Portfolio demonstration.</p>
      </div>
    </footer>
  );
};
