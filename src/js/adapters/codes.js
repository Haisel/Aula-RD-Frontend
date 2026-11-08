/**
 * Códigos de barras (JsBarcode) y QR (qr-code-styling), ambos con carga diferida.
 *
 * ```html
 * <svg data-au-barcode="20260001" aria-label="Código del carné 20260001"></svg>
 * <div data-au-qrcode="https://aulard.do/verificar/20260001" data-au-size="160"></div>
 * ```
 * @module adapters/codes
 */
import { lazy } from './lazy.js';
import { cssToken } from '../core/theme.js';

export const loadBarcode = lazy('JsBarcode', async () => (await import('jsbarcode')).default);
export const loadQr = lazy('QRCode', async () => (await import('qr-code-styling')).default);

/**
 * Dibuja un código de barras CODE128 en un `<svg>` (o crea uno).
 * @param {string} value Valor a codificar.
 * @param {object} [options] Opciones de JsBarcode y `{ target }`.
 * @param {SVGElement} [options.target] SVG destino.
 * @returns {Promise<SVGElement>} El SVG con el código.
 */
export async function barcode(value, { target, ...options } = {}) {
  const JsBarcode = await loadBarcode();
  const svg = target ?? document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svg, value, {
    format: 'CODE128',
    lineColor: '#142b4a',
    background: 'transparent',
    height: 56,
    fontSize: 14,
    font: 'Plus Jakarta Sans',
    margin: 0,
    ...options,
  });
  return svg;
}

/**
 * Dibuja un código QR con los colores de la marca.
 * @param {HTMLElement} container Contenedor.
 * @param {string} data Texto o URL.
 * @param {object} [options] Opciones de qr-code-styling (`width`, `height`, `image`…).
 * @returns {Promise<{ download: (name?: string) => Promise<void>, update: (data: string) => void }>} Controlador.
 */
export async function qrcode(container, data, options = {}) {
  const QRCodeStyling = await loadQr();
  const size = Number(container.dataset.auSize ?? 180);
  const qr = new QRCodeStyling({
    width: size,
    height: size,
    type: 'svg',
    data,
    margin: 4,
    qrOptions: { errorCorrectionLevel: 'M' },
    dotsOptions: { color: '#142b4a', type: 'rounded' },
    cornersSquareOptions: { color: cssToken('accent-text') || '#0e766b', type: 'extra-rounded' },
    cornersDotOptions: { color: '#142b4a' },
    backgroundOptions: { color: '#ffffff' },
    ...options,
  });
  container.replaceChildren();
  qr.append(container);
  return {
    download: (name = 'codigo-qr') => qr.download({ name, extension: 'png' }),
    update: (next) => qr.update({ data: next }),
  };
}
