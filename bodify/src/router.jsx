import { ROUTES } from "./routes";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter(ROUTES)

export default function Router() {
  return <RouterProvider router={router} />;
}
