import ReactDOM from 'react-dom/client';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  ApolloLink
} from '@apollo/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './style.css';
import { DemoPage } from './DemoPage';

const httpLink = createHttpLink({
  uri: 'https://main--locality.apollographos.net/graphql',
  headers: {
    delay: 3000
  }
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([httpLink])
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
