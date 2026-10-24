# GAS: catálogos separados Acero epoxi / SIGAS

Rama local `prueba/gas-catalogos-epoxi-sigas`, base `prueba/gas-catalogos-tecnicos-pendientes`, commit `d7f03b8`. Sin subida, publicación o cambios en vistas HTTPS. Los diámetros definitivos continúan bloqueados.

## Fuentes identificadas y organización

La confirmación del propietario identifica las fotografías de las Tablas 3 y 18 como correspondientes al sistema **acero epoxi**. Se registra en `datos/catalogos/acero-epoxi/procedencia.json` y en el catálogo de lectura del navegador. No equivale a verificar edición, vigencia, condiciones ni aplicabilidad normativa.

Los originales no se movieron ni duplicaron, para conservar referencias, hashes, pruebas y archivos históricos:

| Catálogo | Fuente fotográfica | Archivo de datos | Estado |
|---|---|---|---|
| Acero epoxi · roscado · GN | `fuentes/tabla-3-347520.jpg` | `datos/tabla-3.js` | 441 capacidades cotejadas visualmente; no habilitado |
| Acero epoxi · roscado · GN | `fuentes/tabla-18-347525.jpg` | `datos/tabla-18.js` | 225 equivalencias, 9 coeficientes y 9 d cotejados; criterio técnico pendiente |
| SIGAS | No localizado en este entorno | Sin datos numéricos | Ficha independiente vacía, sin reutilizar acero epoxi |

La ficha SIGAS es `datos/catalogos/sigas/procedencia.json`. `datos/catalogos-sistemas-gas.js` mantiene identidades independientes. No asigna las fuentes epoxi si se entrega otra fotografía/identificador; SIGAS devuelve siempre su propio conjunto vacío mientras falten sus originales. Ninguna ficha entra al registro de producción `CATALOGOS_GAS_VERIFICADOS`, que continúa vacío.

### Búsqueda SIGAS

Se revisaron archivos accesibles del repositorio y /workspace, las carpetas de descargas disponibles, nombres e historial local de fuentes y **32 ZIP**. Los archivos de imagen encontrados en esos ZIP son copias de las dos tablas anteriores; no aparecieron fotografías, PDF ni textos identificables de SIGAS. El directorio de adjuntos de turnos anteriores no está disponible en esta sesión. No se accede a archivos de otros chats.

El registro es `auditoria/busqueda-sigas.json`. No se puede declarar completa ninguna tabla SIGAS sin localizarla. Faltan las fotografías completas de capacidades y equivalencias de SIGAS, encabezados/notas/unidades, edición, manual del fabricante y familia exacta del sistema, dimensiones/interiores, accesorios, método y condiciones de gas/presión. No hace falta volver a aportar el proyecto ni las fotos epoxi ya conservadas.

## Cotejo de las fotografías originales

Se abrieron las dos imágenes completas, se confrontaron las filas y columnas con los datos existentes y se ampliaron las zonas de detalle. La ampliación no añadió ni reconstruyó información. El registro por coordenada tiene **666 posiciones** en `auditoria/cotejo-epoxi-2026-10-24.csv`: 441 de Tabla 3 y 225 del complemento de Tabla 18. Cada posición distingue lectura impresa de validación técnica, que sigue pendiente.

**Se detectó una corrección adicional en Tabla 3:**

| Longitud | Diámetro nominal | Antes en datos | Leído en foto y corregido | Unidad |
|---|---|---:|---:|---|
| 34 m | 4″ | 155753 | **155735** | L/h |

La fotografía muestra `155,735`. Es una transposición de los dos últimos dígitos, no un ajuste por fórmula. Se mantuvieron originales y registros históricos; se añadió la corrección explícita en datos, historial, referencia de integridad y exportaciones de auditoría. Las cinco correcciones anteriores se conservan; ahora son **seis** respecto de la referencia de `1e99313`. Las pruebas que comprueban su número/lista se actualizaron para incluir la sexta, sin quitar casos ni modificar las fixtures históricas.

Después de esa corrección, las 441 capacidades coinciden con la relectura registrada y las 225 equivalencias coinciden con sus lecturas impresas. Los controles 50 m / ½″ = **715**, ¾″ = **1975**, 1″ = **4035**, y 65 m / ½″ = **630 L/h** permanecen intactos. No se cambiaron los valores de Tabla 18.

La relectura y las pruebas NO constituyen un segundo revisor técnico independiente ni una validación normativa. El CSV congela el cotejo, no es un OCR capaz de demostrar automáticamente qué dice cada píxel.

### Encabezados, unidades, notas y edición

- Tabla 3: título GAS NATURAL; caudal en **litros de gas por hora**; longitud de cañería en **metros**; nueve nominales de ½″ a 4″ y encabezados 13/19/25/32/38/51/63/76/101 mm. Densidad impresa **0,65**, nota **«Para caída de presión h = 10 mm.»**. No es una presión disponible de suministro ni autoriza asumirla como tal.
- Tabla 18: longitudes equivalentes de accesorios **a rosca, en diámetros**. Coeficientes 14/30/20/20/60/10/333/7/100 d; reducción referida al diámetro menor. El complemento usa d de encabezado 0,013 a 0,101. Las equivalencias se normalizan en metros conforme al uso de esos d en el ejemplo; no se afirma que el complemento tenga un rótulo explícito de unidad «m» ni que esos d sean interiores comerciales acreditados.
- Ejemplo impreso: dos codos90 de ¾″, `2 × 30 × 0,019 = 1,14`. Se conserva separado de las discrepancias.
- No hay portada, edición ni fecha editorial verificables en las fotos. La atribución NAG-200 procede del usuario; su edición, vigencia, modificaciones/erratas y aplicabilidad requieren documentación identificable.

## Diferencias y criterios que siguen pendientes

- **Cinco codos90 de 2″:** impreso **7,67 m**, producto con d=0,051 **7,65 m**. La diferencia de 0,02 m no se explica por redondear ese producto a centésimos. Una errata u otro d/criterio son hipótesis; no se selecciona ninguna sin documento. No se reemplaza el impreso por el producto.
- **Cinco tees directas de 3″:** se conserva **7,60 m**, lectura coincidente con el producto. La vía directa y la vía con giro siguen siendo distintas.
- **Nueve discrepancias de codos45:** ocho compatibles con truncamiento en esas celdas y una incompatible con truncamiento/redondeo usando d mostrado. Eso no prueba una regla de redondeo. Se conservan el detalle y las diferencias en `AUDITORIA-FINAL.md` y `auditoria/redondeos.csv`.
- **Llaves:** una cantidad de «llaves de paso» no identifica automáticamente válvula macho (100d), globo (333d) o esclusa (7d). Se reutiliza la cantidad y se deja pendiente solo el tipo.
- **Cuplas:** el largo comercial configurado se reutiliza. Sin segmentos continuos no se conoce su cantidad real; falta además el criterio documentado para incluir/excluir sus pérdidas en el método. No se supone cantidad ni pérdida cero.
- **Reducciones:** distinguir independientes de tees/codos reductores para no duplicar piezas. Se conservan en materiales y fuera de equivalentes solo por la particularidad del método de clase. Una instalación real puede exigir pérdidas adicionales.
- **Producto/suministro:** fabricante, serie/norma, exteriores/espesores/interiores y tolerancias, accesorios y roscas compatibles, localidad/distribuidora, GN, densidad/poder calorífico/fuentes, presión disponible/mínima y pérdida admisible comprobadas. La confirmación de origen no completa estos datos.

## Preparación del cálculo y accesorios de una sola carga

El motor general y el motor iterativo de clase permanecen intactos. La selección de candidatos, equivalencias por medida, fila superior, +15 m solo inicial y comprobaciones de recorridos no se alteran para reproducir resultados esperados.

El nuevo puente de solo lectura reutiliza **la misma normalización de carga manual que usa materiales**. Conserva las identidades físicas y los vínculos existentes, separa ceros explícitos de cantidades pendientes, reconoce tees compartidas una sola vez y no transforma una tee en codo por su vía de giro. No suma detalle + total rápido. Recupera la orientación física, demanda y referencias por tramo sin depender del orden de carga.

Esta preparación expone piezas/cantidades/conexiones, **no calcula aún sus equivalentes ni los incorpora al motor normativo**. Tees sin punto, vías, tipos de válvula o configuraciones reductoras ambiguos siguen pendientes. Las posiciones desconocidas no obligan a reingresar cantidades; para cuplas se solicitan solo los segmentos que falten. Si hay contradicción de identidad, se conserva la pieza y se marca el conflicto.

El diagnóstico prepara una vista simple de diámetro por tramo con nombres legibles. Solo podría mostrar un diámetro automático con una habilitación técnica externa al respaldo, catálogo aprobado y firma vigente. Los flags guardados/importados por sí solos no bastan. Hoy ambos catálogos están bloqueados y todos esos diámetros se muestran **Pendiente**; nunca se reutiliza un resultado anterior como si fuera vigente.

## Selección única por proyecto y compatibilidad

En GAS → Calcular diámetros · diagnóstico se elige el **Catálogo técnico del proyecto**. Se guarda como `instalacion.perfil.catalogoTecnicoGas`, compatible con el respaldo JSON v1 y con cada proyecto independiente. Se puede cambiar o dejar pendiente.

La elección no reescribe silenciosamente el material/unión ya guardados: si entran en contradicción, muestra un aviso y conserva los valores. Los proyectos antiguos con identificación exacta epoxi/roscado pueden visualizar su catálogo sin migrar ni escribir el disco; una selección explícita prevalece. No se crea un catálogo en AGUA/CLOACAS.

Se mantiene una carga manual, Calcular materiales y una lista. Las fuentes, auditorías y pendientes adicionales están en el desplegable técnico. No se generan ejemplos, medidas, posiciones, accesorios ni perfiles de presión automáticos.

## Verificación y pendientes de entrega

**545 pruebas aprobadas: 519 anteriores + 26 nuevas**. Incluyen fuentes independientes, corrección fotográfica y coordenadas, bloqueo de SIGAS, selección por proyecto, importación de respaldos con fotos, cantidades únicas y ceros, extremos invertidos, rechazo de flags inventados y conservación de PDF/materiales. Los módulos de cálculo, consumos y proyectos, planificador, fotos originales y Tabla 18 permanecen sin cambios.

El empaquetado comprueba **14 módulos incorporados**, manteniendo index.html autónomo para Android/content://. No hay dependencias, IA ni servicios nuevos. La prueba visual sigue pendiente; no se realizó una nueva sesión de navegador en esta etapa por la restricción conocida de Chromium del entorno. No se afirma una comprobación visual Android nueva.

Antes de habilitar diámetros faltan los documentos/tipos/condiciones anteriores, una revisión técnica independiente de las fuentes y el método, el adaptador numérico real por catálogo y el enlace validado de las cantidades a equivalentes/tees/cupla. Se deberá comparar contra ejercicios completos sin forzar pulgadas ni capacidades.
