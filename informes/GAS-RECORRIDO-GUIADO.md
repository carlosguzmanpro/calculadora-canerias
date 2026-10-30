# GAS · recorrido guiado

Base: `3a9893b` (`prueba/sigas-segunda-prueba-58m`).

Cambios exclusivamente de presentación en `index.html`:

1. Proyecto actual y creación de proyectos, con los controles existentes.
2. Sistema y combustible, sin modificar selección ni perfiles técnicos.
3. Acceso a fotografía/croquis opcional; no hay reconocimiento de imágenes.
4. Accesos a carga y revisión de tramos. Cada acceso despliega su sección y cierra las otras dos, sin borrar borradores ni datos. La revisión conserva editar, revisar accesorios y quitar con confirmación.
5. Un único botón principal CALCULAR CAÑERÍA. Resultados, presupuesto y PDF existentes conservados.

Ejercicios separados y herramientas avanzadas continúan disponibles en desplegables. Respaldos, plano, correcciones técnicas y exportaciones mantienen sus controles. No se modificaron fuentes del motor, tablas, formatos JSON ni módulos AGUA/CLOACAS.

Comprobación móvil adicional: apertura de los pasos, recuperación Casa 1, edición/cancelación sin alterar modelo ni proyecto, creación de proyecto vacío, agregar/quitar tramo, volver a Casa 1, cálculo, impresión sin controles y recuperación tras recarga. Viewport táctil Chromium 390×844; no es una prueba en dispositivo Android físico.

Verificaciones de entrega:
- 25 comprobaciones móviles de regresión y 1 nueva del recorrido guiado, todas correctas.
- Empaquetado autónomo `content://` verificado (22 módulos locales sin cambios).
- Informes reproducibles de Casa 1, referencia SIGAS y segunda prueba comprobados contra el motor.
- Ningún archivo de tablas, equivalencias, cálculos o almacenamiento fue modificado.
