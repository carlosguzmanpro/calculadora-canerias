# Intermediario Gemini: preparación sin conexión

Este módulo NO llama a Google. No tiene claves, modelo configurado, URL de servicio, autenticación real ni despliegue. Su punto de entrada siempre devuelve `503 IA_DESACTIVADA`, incluso si se le pasan variables de entorno. El navegador tampoco tiene transporte ni endpoint. No basta con cambiar un ajuste para activar IA.

`createHandler` permite probar el flujo con dependencias inyectadas: autenticación de sesión, consumo de cuota y transporte falso. Por defecto deniega todo. El esquema de salida e instrucciones están preparados. Los valores ausentes quedan null; el modelo nunca confirma por el usuario. Un resultado válido estructuralmente no garantiza exactitud.

Controles probados: acceso no autorizado, método, consentimiento de envío, tipos y firmas de imagen PNG/JPEG/WebP, imagen hasta 2 MiB, cuerpo hasta 3 MiB aun sin Content-Length, respuesta hasta 256 KiB, tiempo de espera, cuotas agotadas y errores sin exponer mensajes del proveedor ni contenido. No hay reintentos, facturación, registros de imágenes ni CORS abierto. La validación de firma no sustituye una decodificación completa de imagen.

Para una etapa posterior autorizada faltan: verificar cuenta/modelo gratuito sin facturación, implementar autenticación real y cuotas persistentes atómicas, transporte Gemini con secreto solo en servidor (incluida extracción del JSON de candidates y manejo de rechazos/finishReason, no solo el HTTP), normalizar imágenes conservando legibilidad y quitando metadatos, probar cuotas/latencia/límite de CPU en el alojamiento elegido, fijar orígenes permitidos como complemento (no sustituto) de autenticación y realizar un despliegue protegido. Un proceso en memoria no es un control de cuota distribuido suficiente. También habrá que enlazar la respuesta a la solicitud/foto que la originó y evitar que una respuesta tardía reemplace un borrador actual.

No se incluye configuración de proveedor, workflow de GitHub ni archivo de secretos. No es un servicio listo para publicar. Las pruebas usan solo objetos Request/Response y funciones locales, sin sockets ni Internet.
