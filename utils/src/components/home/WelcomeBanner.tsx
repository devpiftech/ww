
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const WelcomeBanner: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-casino-purple to-casino-blue rounded-xl overflow-hidden mb-12">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODQgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuNC4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIzIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMjcwLjcgMEMzMzEuNiAwIDM4NCA0OC40IDM4NCAxMDkuM3YzOTUuNCBjMCAxLjRDMzg0IDUwOS4xIDM3OS4xIDUxMiAzNzcgNTEyYy0yLjEgMC00LjItMS4zLTUuNi0zLjNMMjg0LjcgMzY3LjIgMTk3LjcgNTA4LjcgQzE5Ni4zIDUxMC43IDE5NC4yIDUxMiAxOTIgNTEyczAtMi45IDAtNy4zVjM1OC45TDY4LjcgNTA4LjcgQzY3LjMgNTEwLjcgNjUuMiA1MTIgNjMgNTEycy02LTIuNi02LTYuNlYxMDkuM0M1NyA0OC40IDEwOS40IDAgMTcwLjMgMEgyNzAuN3pNMTY3LjMgMzA5LjEgYzcuOCA0LjggMTcuNiA0LjggMjUuNCAwbDIwMS43LTEyNC4yYzYuNC0zLjkgOC40LTEyLjMgNC41LTE4LjdzLTEyLjMtOC40LTE4LjctNC41TDE2Ny4zIDE2Ni41Yy0yLjYgMS42LTUuOSAxLjYtOC41IDBsLTEzMC05Ni4xYy02LjQtMy45LTE0LjgtMS45LTE4LjcgNC41cy0xLjkgMTQuOCA0LjUgMTguN0wxNjcuMyAzMDkuMXoiLz48L3N2Zz4=')] opacity-10 p-8 bg-contain bg-right"></div>
      <div className="relative z-10 p-8">
        <h1 className="text-4xl md:text-5xl font-russo mb-4 text-white">
          Welcome to <span className="text-casino-gold">WayneWagers</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 max-w-2xl mb-6">
          The ultimate social casino experience with exciting games and amazing rewards!
        </p>
        <Link to="/games">
          <Button className="casino-btn-secondary text-lg px-6 py-6">
            Start Playing Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomeBanner;
