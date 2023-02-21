import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './style.css';
import { DemoPage } from './DemoPage';

const client = new ApolloClient({
  uri: 'https://main--locality.apollographos.net/graphql',
  cache: new InMemoryCache()
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <DemoPage />
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ApolloProvider client={client}>
    <RouterProvider router={router} />
  </ApolloProvider>
);
