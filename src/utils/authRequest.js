export async function authRequest(request) {
  let timer;
  try {
    return await Promise.race([request, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Não foi possível verificar a sessão. Verifica a ligação.')), 12000);
    })]);
  } finally { clearTimeout(timer); }
}
