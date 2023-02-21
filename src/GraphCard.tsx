import { FieldDefinitionNode, Kind, parse, TypeNode } from 'graphql/language';
import { useEffect, useState, Fragment } from 'react';

const printType = (type: TypeNode): string => {
  if (type.kind === 'NonNullType') {
    return `${printType(type.type)}!`;
  } else if (type.kind === 'ListType') {
    return `[${printType(type.type)}]`;
  }
  return type.name.value;
};

const printField = (field: FieldDefinitionNode) =>
  `${field.name.value}${
    field.arguments && field.arguments.length > 0 ? '(…)' : ''
  }: ${printType(field.type)}`;

export const pluralize = (number: number, label: string) =>
  `${number === 0 ? 'No' : number} ${
    label.slice(-1) === 'y'
      ? number === 1
        ? label
        : `${label.slice(0, label.length - 1)}ies`
      : `${label}${number === 1 ? '' : 's'}`
  }`;

export const GraphCard = ({
  subgraph,
  href,
  description
}: {
  subgraph: string;
  href: string;
  description?: React.ReactNode;
}) => {
  const [entities, setEntities] = useState<
    {
      typeName: string;
      keys: string[];
      fields: string[];
    }[]
  >();
  const [rootQueryFields, setRootQueryFields] = useState<string[]>();

  useEffect(() => {
    fetch(href, {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        query: `{ _service { sdl } }`
      })
    })
      .then((res) => res.json())
      .then((result) => {
        const schemaAST = parse(result.data._service.sdl);

        const entities = schemaAST.definitions
          .map((node) =>
            node.kind === Kind.OBJECT_TYPE_DEFINITION &&
            node.directives?.find((dir) => dir.name.value === 'key')
              ? {
                  typeName: node.name.value,
                  keys: node.directives
                    ?.find((dir) => dir.name.value === 'key')
                    ?.arguments?.map(
                      (arg) => arg.value.kind === Kind.STRING && arg.value.value
                    ),
                  fields: node.fields
                    // .filter(
                    //   (field) =>
                    //     !node.directives
                    //       ?.find((dir) => dir.name.value === 'key')
                    //       ?.arguments?.map(
                    //         (arg) =>
                    //           arg.value.kind === Kind.STRING &&
                    //           arg.value.value.split(' ')
                    //       )
                    //       .flat(1)
                    //       .includes(field.name.value)
                    // )
                    ?.map((field) => printField(field))
                }
              : null
          )
          .filter((node) => node !== null);

        const rootQueryFields = schemaAST.definitions
          .map((node) =>
            node.kind === Kind.OBJECT_TYPE_DEFINITION &&
            node.name.value === 'Query'
              ? node.fields
                  ?.filter((field) => field.name.value.charAt(0) !== '_')
                  .map((field) => printField(field))
              : null
          )
          .flat(1)
          .filter((x) => x);

        // @ts-ignore
        setEntities(entities);
        // @ts-ignore
        setRootQueryFields(rootQueryFields);
      });
  }, [href]);

  return (
    <div
      style={{
        textDecoration: 'none',
        outline: '1px solid #ccc',
        borderRadius: 8,
        padding: '20px 28px'
      }}
    >
      <a href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3 style={{ margin: '0 0 8px' }}>{subgraph}</h3>
      </a>
      <div className="tertiary">{description}</div>
      {rootQueryFields && (
        <div style={{ marginTop: 20, position: 'relative' }}>
          <span style={{ position: 'absolute', left: -20 }}>
            {rootQueryFields.length === 0 ? '🚫' : '🏠'}
          </span>
          <h4>{pluralize(rootQueryFields.length, 'Entry Query')}</h4>
          <div>
            {rootQueryFields.length > 0 &&
              rootQueryFields.map((line) => <pre key={line}>{line}</pre>)}
          </div>
        </div>
      )}
      {entities && (
        <div style={{ marginTop: 20 }}>
          <h4>{pluralize(entities.length, 'Entity')}</h4>
          {entities.map((e) => (
            <Fragment key={e.typeName}>
              <div style={{ marginTop: 20 }}>
                <b>{e.typeName}</b>
              </div>

              <div className="label">Keys</div>
              {e.keys.map((key) => (
                <pre
                  key={key}
                  style={{
                    position: 'relative'
                  }}
                >
                  <span
                    style={{ position: 'absolute', left: -20 }}
                    title="Federation Key"
                  >
                    🔑
                  </span>
                  {`${e.typeName} { ${key} }`}
                </pre>
              ))}

              <div className="label">Provides</div>
              {e.fields.map((field) => (
                <pre key={field} style={{ position: 'relative' }}>
                  {field}
                </pre>
              ))}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
