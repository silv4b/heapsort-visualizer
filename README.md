# Visualizador Interativo do Heapsort & Árvore Heap
**Disciplina:** Estrutura de Dados & Análise de Algoritmos  
**Tecnologias:** HTML5, CSS3 Moderno, JavaScript Puro (ES6+)

---

## 🎯 Visão Geral
Aplicação interativa desenvolvida para apresentação e ensino do algoritmo de ordenação **Heapsort** e da estrutura de dados **Heap Binário (Max-Heap e Min-Heap)**.

A ferramenta exibe de maneira didática e separada:
1. **Array Sendo Ordenado:** Exibe o resultado final sendo construído passo a passo, na ordem exata de extração da raiz.
2. **Heap Ativo em Memória:** Exibe os elementos ativos do heap mapeados diretamente com os nós da **Árvore Binária Quase Completa em SVG**.

---

## 🚀 Como Executar

Basta abrir o arquivo [`index.html`](./index.html) diretamente no seu navegador preferido (Google Chrome, Microsoft Edge, Firefox, Brave, etc.):

- **Caminho:** `heapsort_visualizer/index.html`
- Ou execute no terminal/PowerShell:
  ```powershell
  Start-Process "heapsort_visualizer\index.html"
  ```
- Ou execute o arquivo [`abrir_visualizador.bat`](../abrir_visualizador.bat).

---

## 🌟 Ordem de Ordenação Conforme o Tipo de Heap

- **Min-Heap ($A[\text{pai}] \le A[\text{filhos}]$):**
  - A raiz sempre contém o **menor elemento** do heap.
  - A extração sucessiva das raízes gera a sequência em **ordem crescente** ($1º \le 2º \le 3º \dots$).
  - O **Array Sendo Ordenado** é preenchido da esquerda para a direita com os menores valores primeiro.

- **Max-Heap ($A[\text{pai}] \ge A[\text{filhos}]$):**
  - A raiz sempre contém o **maior elemento** do heap.
  - A extração sucessiva das raízes gera a sequência em **ordem decrescente** ($1º \ge 2º \ge 3º \dots$).
  - O **Array Sendo Ordenado** é preenchido da esquerda para a direita com os maiores valores primeiro.

---

## ⚙️ Mapeamento Array $\leftrightarrow$ Árvore Binária
Para qualquer elemento ativo no índice $i$ do Heap:
- **Pai:** $\lfloor (i - 1) / 2 \rfloor$
- **Filho Esquerdo:** $2i + 1$
- **Filho Direito:** $2i + 2$
