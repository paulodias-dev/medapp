import { Outlet } from 'react-router-dom';
import { Footer, Header } from './components';

export function Default() {
  return (
    <div className="max-w-screen h-full min-h-screen flex flex-col">
      <Header />

      <Outlet />

      <Footer />
    </div>
  );
}
