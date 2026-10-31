# GAS · etapa 1: organización de interfaz

Base comprobada: `7c6b3a9`, rama `prueba/gas-recorrido-guiado`.
Rama de trabajo: `prueba/gas-etapa1-interfaz-ordenada`.

## Cambios de presentación

- Cinco pasos y sus acciones conservados, con el subtítulo «Cálculo de cañerías y materiales».
- Tres grupos secundarios cerrados inicialmente: Herramientas técnicas; Ejercicios y demostraciones; Respaldos y configuración.
- Se reutilizan los mismos elementos, identificadores y acciones. Los controles de respaldo se trasladan como nodos únicos al menú GAS y regresan a su ubicación compartida al abrir AGUA o CLOACAS. No se clonan inputs ni eventos.
- Renombrar proyecto y estado del sistema/largo comercial: Respaldos y configuración. La revisión de compra, conciliación, detección, edición avanzada y accesos anteriores: Herramientas técnicas. Exportación de lista PDF/CSV: Respaldos y configuración.
- «Agregar accesorios» plegable dentro del formulario. Su apertura y cierre no guardan, borran ni normalizan valores. Vacío se mantiene sin dato; cero se mantiene como ausencia declarada. Una cantidad inválida despliega el mensaje existente.
- La advertencia de compra muestra el largo configurado; se actualiza al recuperar/cambiar proyecto, seleccionar sistema, abrir el plan y guardar opciones. Los valores anteriores se conservan; no se fuerza 4 m ni 6 m.

## Fuera de alcance

No se modificaron fórmulas, tablas, equivalencias, selección de candidatos, criterios hidráulicos, formato JSON ni generación del PDF. No se ejecutaron las etapas 2–5. Plano opcional y revisión fotográfica conservan sus funciones dentro del grupo técnico. No se introdujeron servicios ni dependencias.

## Comprobaciones

Pruebas móviles nuevas en Chromium táctil de 390×844:
- Tres grupos y desplegables inicialmente cerrados; cinco pasos accesibles.
- Cantidades, cero y vacío conservados tras plegar/desplegar, editar, guardar y recuperar.
- Una cantidad inválida no sobrescribe las cantidades previas y deja visible su aviso.
- Casa 1: modelo numérico, almacenamiento y HTML imprimible sin cambios al recorrer los grupos.
- Largo configurado de 4 m y cambio explícito a 6 m; recuperación sin sustitución silenciosa.
- Un solo respaldo y selector de importación al alternar GAS/AGUA/CLOACAS; configuración GAS oculta fuera de GAS.
- Accesos PDF/CSV existentes disponibles; sin desbordamiento horizontal.

Limitación: emulación móvil, no dispositivo Android físico. La validación normativa y los pendientes técnicos preexistentes no cambian.

Resultado de entrega: 904/904 pruebas automáticas; 26/26 comprobaciones móviles anteriores más 2/2 nuevas de esta etapa. Descarga JSON, descarga CSV y llamada de impresión comprobadas desde su nueva agrupación. Integridad del empaquetado y reproducción de informes SIGAS/Casa 1 verificadas. Todos los identificadores HTML anteriores conservados, sin duplicados.
