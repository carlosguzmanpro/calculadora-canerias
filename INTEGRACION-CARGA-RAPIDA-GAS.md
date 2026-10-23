# Integración controlada de carga rápida GAS

Base obligatoria: prueba/foto-gas-persistente, 8c8ecd0.
Nueva rama: prueba/integracion-carga-rapida-gas.

## Comparación previa
Referencia recibida: canerias-gas-carga-rapida-prueba.zip.
SHA-256: bdb20d3bce16f4210239aac07af455e3c9ecbaa3cd5c9077b35922e7d8fc0f18.

Se compararon ambos index.html antes de modificar archivos. En las entradas del ZIP, sólo index.html difiere de la base; los demás archivos coinciden. El ZIP contiene la persistencia de fotografías y las mejoras PDF de 8c8ecd0 más cambios puntuales de carga rápida; no contiene información Git que permita asignar un commit propio a esas modificaciones.

La referencia agrega una línea de resumen dentro del recorrido de nodos de renderRedGas que usa t y d fuera de alcance. Puede producir ReferenceError cuando hay nodos. No se incorporó esa línea: se conserva renderRedGas de la base y el resumen se ubica en renderTramos, donde el tramo y la tarjeta sí están definidos.

## Funciones integradas
- Cinco cantidades rápidas por tramo: codos de 90°, codos de 45°, tees, reducciones y llaves de paso.
- Guardado explícito, recuperación, edición y resumen por tramo.
- Vacío = pendiente; 0 = ausencia confirmada. No se inventan cantidades ni posiciones. Se rechazan negativos, fracciones y números no seguros sin guardar cambios parciales.
- La carga detallada con distancias, tipos y eliminación de accesorios mantiene sus controles y validaciones.
- Las cantidades rápidas no entran en materiales, equivalentes, consumo, diámetros ni PDF técnico. Una futura integración al cálculo requerirá otra etapa y autorización.

## Separación y compatibilidad de datos
Las nuevas cantidades se guardan en conteosRapidosGas, dentro del espacio del proyecto, indexadas por el ID estable del tramo. Esto evita alterar detalle, firmas técnicas, confirmaciones de fotografía o tees confirmadas sólo por anotar una cantidad informativa.

Se pueden recuperar las cantidades del ZIP, que usaba detalle.conteoRapido. Esos datos originales se conservan al editar los accesorios detallados. Una corrección rápida nueva tiene prioridad en pantalla sobre esa copia anterior, sin borrarla. Un registro rápido vacío explícito deja las cantidades pendientes y no recupera accidentalmente un conteo antiguo.

La exportación/importación sigue siendo canerias-respaldo-v1. El proyecto completo incluye automáticamente los metadatos nuevos y los anteriores. Los espacios Mi proyecto y Demostración están separados, incluso si comparten un ID de tramo. Las cantidades rápidas no se asignan a AGUA o CLOACAS.

Al eliminar un tramo, los metadatos asociados pueden permanecer en el respaldo del proyecto; no se muestran ni calculan como si el tramo siguiera activo. Editar los extremos del mismo tramo conserva sus cantidades por ID: corresponde revisarlas si cambió físicamente la instalación.

## Conservación de la base
Motor de diámetros, evaluarTramo, renderRedGas, tablas, planificación de materiales, detección automática, guardado de fotografías, formato PDF, edición existente y respaldos conservados. Continúan los cinco tramos, foto original, planilla de seis columnas, cantidades editables y advertencias. No se habilitaron diámetros definitivos, IA, APIs ni servicios pagos. main no se modificó y no se publicó.

## Pruebas
368 pruebas automáticas aprobadas: las 356 anteriores y doce nuevas.

Los casos nuevos cubren cinco campos, cero frente a pendiente, guardado/recarga/edición y cambio de nombre del tramo, validación atómica, ausencia de cambios en los cálculos y materiales, agregar/quitar accesorios detallados, compatibilidad con el formato del ZIP, tees A/B confirmadas sin duplicación, foto persistente y confirmación, PDF idéntico, respaldos JSON, aislamiento de espacios, renderRedGas con nodos y aviso de almacenamiento bloqueado.

La prueba móvil adicional tests/carga-rapida-browser.test.cjs fue intentada. Chromium no pudo iniciarse en este entorno; no se generó captura ni se aprobó una prueba visual real. La comprobación táctil en Android queda pendiente. El ZIP contiene index.html autónomo, con las once fuentes locales incorporadas y verificadas.

## Prueba desde Android
1. Exportar un respaldo desde la versión actual y conservar su carpeta.
2. Extraer el ZIP completo en una carpeta nueva y abrir index.html. Si Android no comparte los datos entre ubicaciones, recuperar el respaldo completo JSON desde el apartado de respaldos, confirmando sólo después de conservar los datos actuales.
3. En GAS → Mi proyecto → Croquis y tramos, tocar Revisar accesorios en el tramo deseado.
4. En Carga rápida, registrar por ejemplo 5 codos de 90° y 0 de 45°. Dejar vacíos los tipos desconocidos. Tocar Guardar cantidades rápidas del tramo.
5. Cerrar y reabrir el editor o la aplicación y comprobar 5, 0 y los campos pendientes. Editar y guardar otra vez para verificar recuperación.
6. La carga detallada conserva su botón independiente: Guardar accesorios del tramo no sustituye a Guardar cantidades rápidas. Comprobar que permite agregar accesorios con distancia y quitarlos.
7. Verificar tees A/B, foto, confirmación visual y PDF. Las cantidades rápidas no deben sumarse a la lista de compra ni aparecer como resultados técnicos.
8. Exportar un nuevo respaldo: debe conservar también las cantidades rápidas. Una foto aún no guardada sigue requiriendo atender los avisos de almacenamiento de la base.
