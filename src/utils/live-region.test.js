import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { announce, initLiveRegions } from './live-region.js';

const polite = () => document.querySelectorAll('[data-live-region="polite"]');
const assertive = () =>
  document.querySelectorAll('[data-live-region="assertive"]');

describe('live-region', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initLiveRegions', () => {
    it('crea una región cortés y otra asertiva con sus roles', () => {
      initLiveRegions();
      expect(polite()).toHaveLength(1);
      expect(assertive()).toHaveLength(1);
      expect(polite()[0].getAttribute('role')).toBe('status');
      expect(assertive()[0].getAttribute('role')).toBe('alert');
    });

    it('no duplica las regiones si se llama dos veces', () => {
      initLiveRegions();
      initLiveRegions();
      expect(polite()).toHaveLength(1);
      expect(assertive()).toHaveLength(1);
    });

    it('las regiones están vacías y no ocultas para los lectores', () => {
      initLiveRegions();
      const region = polite()[0];
      expect(region.textContent).toBe('');
      expect(region.hasAttribute('hidden')).toBe(false);
      expect(region.getAttribute('aria-hidden')).toBeNull();
    });
  });

  describe('announce', () => {
    it('crea la región si no existía y escribe el texto tras el tick', () => {
      announce('Guardado');
      expect(polite()).toHaveLength(1);
      expect(polite()[0].textContent).toBe('');
      vi.advanceTimersByTime(0);
      expect(polite()[0].textContent).toBe('Guardado');
    });

    it('usa la región asertiva con politeness: "assertive"', () => {
      announce('Error', { politeness: 'assertive' });
      vi.advanceTimersByTime(0);
      expect(assertive()[0].textContent).toBe('Error');
      expect(polite()[0]?.textContent ?? '').toBe('');
    });

    it('vuelve a escribir un mensaje repetido', () => {
      announce('Hola');
      vi.advanceTimersByTime(0);
      announce('Hola');
      expect(polite()[0].textContent).toBe('');
      vi.advanceTimersByTime(0);
      expect(polite()[0].textContent).toBe('Hola');
    });

    it('un mensaje nuevo sustituye al pendiente', () => {
      announce('Uno');
      announce('Dos');
      vi.advanceTimersByTime(0);
      expect(polite()[0].textContent).toBe('Dos');
    });

    it('recrea las regiones si se quitaron del DOM', () => {
      initLiveRegions();
      document.body.innerHTML = '';
      announce('Otra vez');
      vi.advanceTimersByTime(0);
      expect(polite()).toHaveLength(1);
      expect(polite()[0].textContent).toBe('Otra vez');
    });
  });
});
