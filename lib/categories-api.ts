export interface BackendCategoria {
  id: string;
  nombre: string;
}

interface CategoriasResponse {
  data: BackendCategoria[];
}

function getCategoriesEndpoint(): string {
  return "/api/proxy/categorias";
}

function buildAdminHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  return headers;
}

export async function fetchPublicCategories(): Promise<BackendCategoria[]> {
  const response = await fetch(getCategoriesEndpoint(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`No se pudo obtener categorias: ${response.status}`);
  }

  const payload = (await response.json()) as CategoriasResponse;
  const data = Array.isArray(payload.data) ? payload.data : [];

  return data.filter(
    (categoria) =>
      typeof categoria?.id === "string" &&
      categoria.id.trim().length > 0 &&
      typeof categoria?.nombre === "string" &&
      categoria.nombre.trim().length > 0,
  );
}

export async function createCategory(
  nombre: string,
): Promise<BackendCategoria> {
  const response = await fetch(getCategoriesEndpoint(), {
    method: "POST",
    headers: buildAdminHeaders(),
    body: JSON.stringify({ nombre }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo crear la categoria: ${response.status}`);
  }

  return (await response.json()) as BackendCategoria;
}

export async function updateCategory(
  id: string,
  nombre: string,
): Promise<BackendCategoria> {
  const response = await fetch(`${getCategoriesEndpoint()}/${id}`, {
    method: "PUT",
    headers: buildAdminHeaders(),
    body: JSON.stringify({ nombre }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo editar la categoria: ${response.status}`);
  }

  return (await response.json()) as BackendCategoria;
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`${getCategoriesEndpoint()}/${id}`, {
    method: "DELETE",
    headers: buildAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error(`No se pudo eliminar la categoria: ${response.status}`);
  }
}
