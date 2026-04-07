interface ContactMessageInput {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      mensaje?: string;
      error?: string;
    };

    if (payload?.mensaje) return payload.mensaje;
    if (payload?.error) return payload.error;
  } catch {
    // Ignore parse errors.
  }

  return response.statusText || `Error HTTP ${response.status}`;
}

export async function sendContactMessage(
  input: ContactMessageInput,
): Promise<void> {
  const response = await fetch("/api/proxy/contacto", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}
