# Verificación de sistemas y combustibles GAS

Base: `3c60d20`. Caso físico: cinco tramos, 20,60 m, 21.800 kcal/h, 15 codos, dos tees y tres llaves. Sin modificar tablas ni fórmulas.

| Sistema | Combustible | Capacidad documental utilizada | Equivalencias propias | Estado |
|---|---|---|---|---|
| SIGAS | GN | Tabla 4, p.22, ed.15/2025 | Tabla 3, pp.24–25, producto y diámetro | Motor GN existente; conserva candidatos del ensayo 25/25/20/25/20 mm |
| SIGAS | GLP genérico | Ninguna: no se identifica automáticamente como propano | No se certifican pérdidas sin combustible/aplicabilidad identificados | Pendiente; nunca usa Tabla 4 GN ni aplica Tabla 5 por suposición |
| SIGAS | Propano gaseoso identificado | Tabla 5, p.23 | Tabla 3, pp.24–25, según producto y condiciones aplicables | Consultas documentales; no existe todavía un cierre automático verificado equivalente al motor SIGAS GN |
| FUSIOGAS | GN | Tabla GN, p.19, V.1.2026 | Equivalencias p.18; catálogo pp.28–30 | Consultas documentales; integración/validación del dimensionamiento pendientes |
| FUSIOGAS | GLP | Tabla GLP, p.20, V.1.2026 | Equivalencias propias p.18 | Consultas documentales; no usa capacidades SIGAS |
| EPOXI | GN | Fotografías Tablas 3 y 18 del catálogo epoxi | Tabla 18 epoxi; edición y aplicabilidad aún pendientes | No habilita diámetros definitivos |
| EPOXI | GLP | No hay tabla GLP aplicable incorporada | No se extrapolan equivalencias ni método GN a GLP | Bloqueado por falta de respaldo técnico específico |

## Problemas corregidos

1. Cambiar combustible no reconstruía la lista de tramos: podía quedar visible un candidato GN anterior aunque el motor ya lo hubiera invalidado. Ahora se actualizan lista, diagnóstico y resultado.
2. Las propiedades anteriores permanecían en los campos generales del nuevo gas, aunque estuvieran suspendidas internamente. Ahora quedan archivadas por combustible y los campos nuevos quedan pendientes.
3. Al volver al mismo combustible solo se recuperan condiciones con asociación explícita, PCS positivo y fuente guardada. Los registros históricos ambiguos o pendientes no se reactivan. Recuperar valores no aprueba suministro ni normativa.
4. Al ingresar propiedades se refrescan las consultas documentales y los resultados existentes, sin fórmulas alternativas.

Se conservan las presiones y su fuente en el historial del combustible correspondiente, evitando trasladarlas automáticamente a otro gas. La referencia orientativa 22.300 de la consulta de consumos no se convierte en PCS técnico universal.

## Pruebas

Se recorren las combinaciones en ambos modos, verificando conservación física, fabricante, tabla/página, caudales y PDF. Para los ensayos automatizados se introducen explícitamente PCS ficticios de 22.000 (GLP) y 23.000 (propano), con su fuente de prueba; no son valores predeterminados de la aplicación ni condiciones universales. GN utiliza los 9.300 del ensayo existente.

Se comprueba además que los IDs de accesorios SIGAS y FUSIOGAS no se aceptan en el catálogo ajeno, que sus equivalencias documentales conservan el origen y que los registros históricos no vinculados no se reutilizan.

Sin cambios en main, producción ni datos originales de fabricantes.
