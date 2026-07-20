# Auditoría técnica breve — Visual y navegación

Fecha: 20 de julio de 2026

## Hallazgos

- Una regla global de encabezados podía aplicar fondo verde a la barra principal y reducir el contraste de JUNTÉMONOS MÁS.
- La navegación móvil dependía de desplazamiento horizontal y ocultaba los textos de opciones, dificultando reconocer los accesos.
- El acceso Continuar solo aparecía cuando existía una vista previa almacenada.
- Los colores activos, secundarios y de foco no tenían una jerarquía uniforme en todas las vistas.

## Ajustes realizados

- Paleta ejecutiva unificada con verde Starbucks, verde oscuro, verde claro, blanco, texto #1E1E1E y bordes #D7E2DD.
- JUNTÉMONOS MÁS con contraste adaptado: verde/negro en barra clara y blanco en el Hero oscuro, respetando `campaign.json`.
- Barra de escritorio equilibrada; opción activa con fondo verde y texto blanco.
- Menú responsive desplegable para tablet y móvil, sin scroll horizontal, con controles táctiles y cierre exterior/Escape.
- Continuar visible en Inicio, recuperando la última vista interna o Regional Review como destino inicial.
- Hero, foco, hover, Cards, avisos offline y actualización PWA con mayor legibilidad y sombras ligeras.
- Service Worker versionado sin activación forzada; la actualización continúa bajo acción explícita del usuario.

## Validación

- Rutas locales rotas: 0.
- Enlaces externos inseguros: 0.
- Funciones duplicadas: 0.
- JavaScript y Service Worker: sintaxis correcta.
- Manifest y JSON: válidos.
- Navegación por teclado, Escape, clic exterior y estados activos implementados.
- Estructura relativa compatible con GitHub Pages y modo offline.

No se eliminaron archivos, recursos ni funciones existentes.
