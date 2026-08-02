/**
 * Version desplegada de la app.
 *
 * El reconciliador del server inyecta APP_VERSION=${IMAGE_TAG} en el contenedor,
 * asi que refleja el tag que esta corriendo de verdad. Se lee en runtime y no en
 * build, para que la imagen no dependa de su propio numero de version.
 *
 * En desarrollo la variable no existe y se muestra "dev".
 */
export function getAppVersion(): string {
  return process.env.APP_VERSION?.trim() || "dev"
}
