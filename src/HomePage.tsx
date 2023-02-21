import { useEffect, useState } from 'react';
import { GraphCard, pluralize } from './GraphCard';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const [publicGraphs, setPublicGraphs] = useState<
    {
      subgraph: string;
      href: string;
      description?: string;
    }[]
  >([]);

  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/daniman/simple-graphql-servers/main/public-graphs.json'
    )
      .then((res) => res.json())
      .then((res) => setPublicGraphs(res));
  }, []);

  return (
    <div>
      <h2>Simple GraphQL Servers</h2>
      <p>
        These are small GraphQL servers that each fetch data from a unique free
        API. They are enabled with Apollo Federation and are designed to be
        compatible with each other (
        <a href="https://github.com/daniman/simple-graphql-servers/tree/main/api">
          code on GitHub
        </a>
        ).
      </p>
      <p>
        Check out an example of using these graphs together on the{' '}
        <Link to="/demo">demo page</Link>.
      </p>
      <h3 style={{ marginTop: 40 }}>
        {pluralize(publicGraphs.length, 'simple graph')}:
      </h3>
      <div className="grid">
        {publicGraphs.map((props) => (
          <GraphCard key={props.href} {...props} />
        ))}
      </div>
    </div>
  );
};
