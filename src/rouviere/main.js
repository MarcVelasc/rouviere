/**
 * Punto de entrada de la app de Rouviere (página app/index.html).
 * Carga fuentes y estilos, y arranca la app con boot().
 */
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import './estilos/index.css';
import { boot } from './boot.js';

boot();
