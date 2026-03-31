import useSWR from "swr";

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <Database />
    </>
  );
}

function Database() {
  const { data } = useStatus();
  const databaseVersion = data?.dependencies?.database?.version ?? "Carregando...";
  const maxConnections = data?.dependencies?.database?.max_connections ?? "Carregando...";
  const openedConnections = data?.dependencies?.database?.opened_connections ?? "Carregando...";

  return (
    <div>
      <h1>Banco de Dados</h1>
      <p>Versão: {databaseVersion}</p>
      <p>Conexões máximas: {maxConnections}</p>
      <p>Conexões abertas: {openedConnections}</p>
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useStatus();
  let updatedAtText = "Carregando...";
  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return (
    <div>
      <div>Última atualização: {updatedAtText}</div>
    </div>
  );
}

function useStatus() {
  return useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
}

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}
