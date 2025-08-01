/**
 * CONFIGURAÇÃO INICIAL PARA TESTES UNITÁRIOS
 * Sistema de Telemedicina - Tarefa 2
 */

// Mock do DOM para testes que manipulam elementos HTML
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock de funções globais do navegador
global.alert = jest.fn();
global.confirm = jest.fn(() => true);
global.prompt = jest.fn();

// Mock do fetch para requisições HTTP
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock do console para testes mais limpos
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock do Supabase
global.supabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: {}, error: null }))
    })),
    eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signIn: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null }))
  }
};

// Configurações de timeout para testes assíncronos
jest.setTimeout(10000);

// Limpar todos os mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset do DOM
  document.body.innerHTML = '';
  
  // Reset do localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset do sessionStorage
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

// Configuração após todos os testes
afterAll(() => {
  dom.window.close();
});