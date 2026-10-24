# SIGAS: pérdidas identificadas y revisión móvil

Base: 7e42839. Rama: prueba/sigas-perdidas-accesorios-movil.

Se conservan las tablas originales del manual SIGAS Thermofusión ed.15/2025:
Tabla 4, p.22 (GN), Tabla 3, pp.24–25 (equivalentes impresos).
No se recalcula un equivalente impreso a partir del número de diámetros.

## Cambios

- Familia explícitamente confirmada para codos normales/MH y llaves esféricas con
  medidas en mm: en cada iteración se consulta la fila original del diámetro
  candidato. Si no existe una fila única compatible, la pérdida queda pendiente.
- Se conservan las asignaciones anteriores de producto exacto para un vector de
  diámetros. No se convierte automáticamente un producto roscado o reductor en
  otro producto, ni se presupone que todos los codos son normales.
- Tees: asignación explícita de producto y vía por recorrido, sin familia automática.
  Falta confirmar variante normal/reductora, tres conexiones y paso directo/giro.
  Un cambio de vector requiere revisar esas asignaciones. Una pieza física aporta
  una vez por recorrido y sigue apareciendo una sola vez en materiales.
- Tabla inicial → recalculado antes de la lista de compra; detalles plegables.
  Formularios cerrados al entrar, se abren al pedir editar. AGUA/CLOACAS separados.

## Resultados comprobados

Ejercicio conservado: 58 m, 19 codos90, 2 tees, 3 llaves, 29200 kcal/h.
Sin asignar productos por suposición conserva candidatos parciales exteriores:
M–A 32 mm; A–B 25 mm; A–Termo 25 mm; B–Calefactor 20 mm; B–Cocina 25 mm.
No son resultados definitivos con todas las pérdidas.

Prueba controlada en el propio ejercicio: identificar los 7 codos M–A como
Codo Normal a 90º, exterior candidato 32 mm, aplica 7 × 1,191 = 8,337 m a cada
recorrido afectado, sin alterar cantidades ni datos del usuario. Es una prueba
explícita de asignación; no confirma qué producto tiene la instalación real.

Regresión numérica independiente: recorrido 20 m, 18600 kcal/h, 100 codos normales
90º declarados; candidato inicial 25 mm y recalculado estable 32 mm; equivalente
119,1 m; fila 140 m; capacidad 2,303 m³/h. No pertenece al ejercicio de cinco tramos.

## Pendientes técnicos

Identificar las variantes reales de codos y llaves, medidas y vías de ambas tees,
ubicación del codo19 respecto del circuito/medidor, otras pérdidas desconocidas,
condiciones de suministro y validación del criterio de recorrido/fila superior.
No se consideran cero pérdidas desconocidas ni se asignan diámetros definitivos a
los tramos guardados. Las discrepancias documentales previas permanecen advertidas.
No se añadió el incremento inicial de 15 m del método EPOXI.

## Verificación

673 casos automáticos aprobados (incluyen proyectos, fotografías, PDF, CSV,
respaldos, materiales y separación de sistemas). Comprobación Chromium móvil
390×844: selección de familia, 5 tramos y 19 codos, sin errores JS ni desborde
horizontal. La prueba móvil general abre ahora explícitamente el formulario
plegado antes de cargar datos de regresión.

Para probar sin volver a cargar: GAS → Ejercicios y demostraciones → Abrir ejercicio
SIGAS. Si ya existe se reutiliza sin sobrescribir sus correcciones. Los productos
se identifican en el desplegable de pérdidas sin volver a ingresar cantidades.
