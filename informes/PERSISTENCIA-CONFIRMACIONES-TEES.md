# Persistencia de confirmaciones SIGAS

Base f4a41a2. Corrección limitada al puente y la presentación de confirmaciones; motor, tablas y cantidades intactos.

Antes, confirmarConjuntoTeeGas devolvía ok:true incluso cuando guardarDatos informaba almacenamiento lleno o bloqueado. El conjunto funcionaba en memoria, pero podía desaparecer al recuperar el proyecto.

Ahora se vuelve a leer CLAVE en localStorage y se compara el conjunto y sus vías con el proyecto activo persistido, sin confiar solo en ultimoGuardadoValido o en el mensaje del último intento. Si la lectura falla o el contenido no coincide, no se anuncia guardado. Estado y mensajes se derivan, no se agregan al respaldo:

- Confirmado y vigente: compatible con las medidas/vías actuales y guardado en el navegador.
- Solo en esta sesión: compatible y aplicado en memoria, sin persistencia comprobada; mensaje «Confirmada solo en esta sesión; no pudo guardarse».
- Requiere nueva confirmación: incompatible con medidas o vías actuales; se conserva el registro anterior y el motor sigue excluyendo sus pérdidas.

El estado de solo sesión no revierte datos nuevos ni cambia pérdidas. La advertencia se muestra junto a la tee y se devuelve ok:false, aplicada:true, guardada:false. Una confirmación guardada anteriormente puede seguir comprobándose como persistida aunque un intento redundante posterior no pueda escribir; se verifica contenido real, no solo ausencia de excepción. Cambiar de proyecto usa su ámbito propio. Tras cambios de configuración se refresca la presentación de tramos para evitar un rótulo vigente obsoleto.

Pruebas añadidas: guardado normal, reapertura, cuota llena, lectura/escritura bloqueada, escritura silenciosamente omitida, recuperación tras fallo, guardado restablecido sin duplicación, invalidación por vías y diámetros y recuperación del estado inválido. Navegador a390px: confirmación táctil fallida, aviso visible, preservación del almacenamiento anterior, reapertura sin falsa confirmación, guardado normal posterior, invalidación y PDF sin controles.

El diagnóstico SIGAS de referencia no cambia: con tees confirmadas compatibles y los otros pendientes originales, Termo33,193m, Calefactor49,990m y Cocina47,180m. 58m/19codos/2tees/3llaves intactos. No se incorporan cuplas estimadas al inventario de pérdidas ni se habilitan diámetros definitivos. No se cambia formato de respaldo, almacenamiento de fotografías ni ninguna otra función.
