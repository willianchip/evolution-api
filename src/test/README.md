# 🧪 Testes Automatizados

Este projeto usa **Vitest** e **Testing Library** para testes automatizados.

## 🚀 Executar Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# Abrir interface visual do Vitest
npm run test:ui
```

## 📁 Estrutura de Diretórios

```
src/test/
├── setup.ts              # Configuração global dos testes
├── mocks/
│   └── supabase.ts       # Mocks do cliente Supabase
├── helpers/
│   └── render.tsx        # Helper customizado para renderizar componentes
└── integration/          # Testes de integração E2E
```

## 📝 Como Adicionar Novos Testes

### Testes de Componentes

```typescript
import { render, screen, fireEvent } from '@/test/helpers/render';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('deve renderizar corretamente', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('deve chamar callback ao clicar', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testes de Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('deve retornar dados corretos', async () => {
    const { result } = renderHook(() => useMyHook());
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

## 🎯 Boas Práticas

1. **Organize testes ao lado dos arquivos**: `Component.tsx` → `Component.test.tsx`
2. **Use describe/it para estruturar**: Agrupe testes relacionados
3. **Mock dependências externas**: Use os mocks em `src/test/mocks/`
4. **Teste comportamento, não implementação**: Foque no que o usuário vê
5. **Mantenha testes isolados**: Cada teste deve ser independente
6. **Use data-testid quando necessário**: Para elementos difíceis de selecionar

## 📊 Cobertura Esperada

- **Meta de cobertura**: >80%
- **Prioridade**: Componentes críticos (auth, pagamentos, etc.)
- **Relatório**: Gerado em `coverage/index.html`

## 🔧 Configuração

A configuração está em `vitest.config.ts`:
- Ambiente: jsdom (navegador simulado)
- Globals: true (usar describe/it globalmente)
- Setup: `src/test/setup.ts` (executado antes de cada teste)

## 🐛 Troubleshooting

### Erro: "Cannot find module '@/...'"
- Verifique o alias no `vitest.config.ts`

### Erro: "window.matchMedia is not a function"
- Já está mockado em `setup.ts`

### Testes lentos
- Use `test.concurrent()` para paralelizar
- Mock chamadas de API externas

## 📚 Recursos

- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
