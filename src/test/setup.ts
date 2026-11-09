import '@testing-library/jest-dom/vitest';

// jsdom no implementa el desplazamiento de la ventana.
window.scrollTo = () => {};
